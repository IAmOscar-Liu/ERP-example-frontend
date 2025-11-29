import { CustomDatePicker } from "@/components/form/CustomDatePicker";
import CustomFormField, {
  CustomFormLabel,
} from "@/components/form/CustomFormField";
import CustomLoadingButton from "@/components/form/CustomLoadingButton";
import CustomTimePicker from "@/components/form/CustomTimePicker";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/context/ToastProvider";
import {
  calculateOvertimePlannedHours,
  localToUTCISOString,
} from "@/lib/timeCalculator";
import {
  dateStringToDate,
  extractErrorMessage,
  toDateOnlyString,
  toTimeOnlyString,
} from "@/lib/utils";
import type { DialogEditProps } from "@/type";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";
import useOvertimeApi from "../api";
import type { Overtime } from "../type";
import type { Employee } from "@/feature/employee/type";

const DEFAULT_FORM_VALUE = {
  workDate: undefined,
  startAt: "17:00",
  endAt: "18:00",
  plannedHours: 0,
  reason: "",
  convertToCompTime: false,
};

function EditOvertimeDrawer(
  props: DialogEditProps<Overtime> & {
    employee?: Employee;
    onSuccess?: () => void;
  },
) {
  const { mode, open, setOpen, employee, onSuccess } = props;
  const overtimeData =
    props.mode === "update" && props.data
      ? {
          workDate: dateStringToDate(props.data.workDate) ?? undefined,
          startAt: toTimeOnlyString(new Date(props.data.startAt), {
            withSecond: false,
          }),
          endAt: toTimeOnlyString(new Date(props.data.endAt), {
            withSecond: false,
          }),
          plannedHours: Number(props.data.plannedHours),
          reason: props.data.reason ?? undefined,
          convertToCompTime: props.data.convertToCompTime ?? false,
        }
      : undefined;
  const { formatMessage: t } = useIntl();
  const { createOvertime, updateOvertime } = useOvertimeApi();
  const { mutateAsync: handleCreateOvertime } = useMutation({
    mutationFn: createOvertime,
  });
  const { mutateAsync: handleUpdateOvertime } = useMutation({
    mutationFn: updateOvertime,
  });

  const formSchema = useMemo(
    () =>
      z
        .object({
          workDate: z.preprocess(
            (val) => {
              if (val === undefined) return undefined;
              if (val instanceof Date) return val;
              return new Date(String(val));
            },
            z.date(t({ id: "general.validation.required" })),
          ),
          startAt: z.string(t({ id: "general.validation.required" })),
          endAt: z.string(t({ id: "general.validation.required" })),
          plannedHours: z.number(),
          reason: z.string().optional(),
          convertToCompTime: z.boolean(),
        })
        .refine(
          (data) => {
            if (data.workDate) {
              return data.plannedHours > 0;
            }
            return true;
          },
          {
            message: "Planned hours must be greater than 0",
            path: ["plannedHours"],
          },
        ),
    [],
  );
  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    shouldUnregister: true,
    defaultValues:
      mode === "create"
        ? DEFAULT_FORM_VALUE
        : (overtimeData ?? DEFAULT_FORM_VALUE),
  });

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    console.log("Submitted:", value);
    if (!employee) return;
    if (mode === "update" && !props.data) return;

    const inputStartAt = localToUTCISOString(
      `${toDateOnlyString(value.workDate)} ${value.startAt}`,
    );
    const inputEndAt = localToUTCISOString(
      `${toDateOnlyString(value.workDate)} ${value.endAt}`,
    );
    if (!inputStartAt || !inputEndAt) return;

    const input = {
      employeeId: employee.id,
      workDate: toDateOnlyString(value.workDate),
      startAt: inputStartAt,
      endAt: inputEndAt,
      reason: value.reason,
      convertToCompTime: value.convertToCompTime,
      plannedHours: value.plannedHours,
    };

    const mutationPromise =
      mode === "create"
        ? handleCreateOvertime(input)
        : handleUpdateOvertime({ ...input, id: props.data!.id });

    await mutationPromise
      .then(() => {
        toast.success({
          title: "Overtime request submitted successfully",
        });
        if (onSuccess) onSuccess();
        setOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast.error({
          title: "Failed to submit overtime request",
          description: extractErrorMessage(e),
        });
      });
  };

  useEffect(() => {
    if (!open) {
      // form.reset(undefined, { keepTouched: false, keepIsSubmitted: false });
      form.reset(DEFAULT_FORM_VALUE, { keepDefaultValues: false });
    } else if (mode === "update" && open && overtimeData) {
      form.reset(overtimeData, { keepDefaultValues: false });
    }
  }, [open]);

  const [workDate, startAt, endAt] = form.watch([
    "workDate",
    "startAt",
    "endAt",
  ]);
  useEffect(() => {
    const getPlannedHours = () => {
      // console.log("plannedHours", { workDate, startAt, endAt });
      if (!workDate || !startAt || !endAt) return null;
      const startLocalDateTime = `${toDateOnlyString(workDate as Date)} ${startAt}`;
      const endLocalDateTime = `${toDateOnlyString(workDate as Date)} ${endAt}`;

      // console.log("LocalDateTime", { startLocalDateTime, endLocalDateTime });

      const startUTCISOString = localToUTCISOString(startLocalDateTime);
      const endUTCISOString = localToUTCISOString(endLocalDateTime);

      // console.log("UTCISOString", { startUTCISOString, endUTCISOString });

      if (!startUTCISOString || !endUTCISOString) return null;
      return calculateOvertimePlannedHours(startUTCISOString, endUTCISOString);
    };
    form.setValue("plannedHours", getPlannedHours() ?? 0, {
      shouldValidate: true,
    });
  }, [workDate, startAt, endAt]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="sm:min-w-[480px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "New" : "Edit"} Overtime Request
          </SheetTitle>
          <SheetDescription>
            Employee: {employee?.fullName ?? "N/A"}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mx-4 mb-4">
              <FormField
                control={form.control}
                name="workDate"
                render={({ field }) => (
                  <FormItem className="mb-4 flex flex-col">
                    <CustomFormLabel required label="Work Date" />
                    <CustomDatePicker
                      placeholder="yyyy/mm/dd"
                      value={field.value as Date | undefined}
                      onChange={(d) => field.onChange(d)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem className="mb-4 flex flex-col">
                    <CustomFormLabel required label="Start At" />
                    <CustomTimePicker
                      value={field.value as string | undefined}
                      onChange={(d) => field.onChange(d)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem className="mb-4 flex flex-col">
                    <CustomFormLabel required label="End At" />
                    <CustomTimePicker
                      value={field.value as string | undefined}
                      onChange={(d) => field.onChange(d)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CustomFormField
                disabled
                type="number"
                control={form.control}
                name="plannedHours"
                label="Planned Hours"
                fieldClassName="mb-4"
              />
              <CustomFormField
                type="textarea"
                control={form.control}
                name="reason"
                label="Reason"
                placeholder="Reason for overtime request"
                fieldClassName="mb-4"
              />
              <CustomFormField
                type="checkbox"
                control={form.control}
                name="convertToCompTime"
                label="Convert to Compensatory Leave"
                fieldClassName="mb-3"
              />
            </div>
            <SheetFooter>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <CustomLoadingButton
                  isLoading={form.formState.isSubmitting}
                  disabled={!form.formState.isValid || !employee}
                >
                  Submit
                </CustomLoadingButton>
              </div>
            </SheetFooter>
          </form>
        </Form>
        {import.meta.env.DEV && <DevTool control={form.control} />}
      </SheetContent>
    </Sheet>
  );
}

export default EditOvertimeDrawer;
