import { CustomDatePicker } from "@/components/form/CustomDatePicker";
import CustomFormField, {
  CustomFormLabel,
} from "@/components/form/CustomFormField";
import CustomLoadingButton from "@/components/form/CustomLoadingButton";
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
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import { useToast } from "@/context/ToastProvider";
import useCompTimeApi from "@/feature/compTime/api";
import { calculateLeaveHours } from "@/lib/timeCalculator";
import { extractErrorMessage } from "@/lib/utils";
import type { DialogEditProps } from "@/type";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";
import useLeaveApi from "../api";
import type { Leave } from "../type";
import type { Employee } from "@/feature/employee/type";

const DEFAULT_FORM_VALUE = {
  leaveTypeId: "",
  startAt: undefined,
  endAt: undefined,
  hours: 0,
  reason: "",
};

function EditLeaveDrawer(
  props: DialogEditProps<Leave> & {
    employee?: Employee;
    onSuccess?: () => void;
  },
) {
  const { mode, open, setOpen, employee, onSuccess } = props;
  const leaveData =
    props.mode === "update" && props.data
      ? {
          leaveTypeId: props.data.leaveTypeId,
          startAt: new Date(props.data.startAt) as Date | undefined,
          endAt: new Date(props.data.endAt) as Date | undefined,
          hours: Number(props.data.hours),
          reason: props.data.reason ?? undefined,
        }
      : undefined;
  const { formatMessage: t } = useIntl();
  const { createLeave, listLeaveTypes, updateLeave } = useLeaveApi();
  const { getBalance } = useCompTimeApi();
  const { data: leaveTypes } = useQuery({
    queryKey: [QUERY_KEYS.LeaveType],
    queryFn: listLeaveTypes,
    staleTime: STALE_TIME.LeaveType,
    enabled: open,
  });
  const { mutateAsync: handleCreateLeave } = useMutation({
    mutationFn: createLeave,
  });
  const { mutateAsync: handleUpdateLeave } = useMutation({
    mutationFn: updateLeave,
  });

  const formSchema = useMemo(
    () =>
      z
        .object({
          leaveTypeId: z.string(t({ id: "general.validation.required" })),
          startAt: z.preprocess(
            (val) => {
              if (val === undefined) return undefined;
              if (val instanceof Date) return val;
              return new Date(String(val));
            },
            z.date(t({ id: "general.validation.required" })),
          ),
          endAt: z.preprocess(
            (val) => {
              if (val === undefined) return undefined;
              if (val instanceof Date) return val;
              return new Date(String(val));
            },
            z.date(t({ id: "general.validation.required" })),
          ),
          hours: z.number(),
          reason: z.string().optional(),

          // derived fields
          isCompLeave: z.boolean(),
          balanceMinute: z.number(),
        })
        .superRefine((data, ctx) => {
          if (data.leaveTypeId && data.startAt && data.endAt) {
            // Validation 1: Hours must be positive
            if (data.hours <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Hours must be greater than 0",
                path: ["hours"],
              });
            }

            // Validation 2: Check compensatory leave balance
            if (data.isCompLeave && data.hours > data.balanceMinute / 60) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Insufficient balance",
                path: ["hours"],
              });
            }
          }
        }),
    [],
  );
  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    shouldUnregister: true,
    defaultValues: {
      ...(mode === "create"
        ? DEFAULT_FORM_VALUE
        : (leaveData ?? DEFAULT_FORM_VALUE)),
      isCompLeave: false,
      balanceMinute: 0,
    },
  });

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    // window.alert(JSON.stringify(value, null , 2));
    // return
    console.log("Submitted:", value);
    if (!employee) return;
    if (mode === "update" && !props.data) return;

    const input = {
      employeeId: employee.id,
      leaveTypeId: value.leaveTypeId,
      startAt: value.startAt.toISOString(),
      endAt: value.endAt.toISOString(),
      reason: value.reason,
      hours: value.hours,
    };

    const mutationPromise =
      mode === "create"
        ? handleCreateLeave(input)
        : handleUpdateLeave({
            id: props.data!.id,
            ...input,
          });

    await mutationPromise
      .then(() => {
        toast.success({
          title: "Leave request submitted successfully",
        });
        if (onSuccess) onSuccess();
        setOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast.error({
          title: "Failed to submit leave request",
          description: extractErrorMessage(e),
        });
      });
  };

  useEffect(() => {
    if (!open) {
      // form.reset(undefined, { keepTouched: false, keepIsSubmitted: false });
      form.reset(DEFAULT_FORM_VALUE, { keepDefaultValues: false });
    } else if (mode === "update" && open && leaveData) {
      form.reset(leaveData, { keepDefaultValues: false });
    }
  }, [open]);

  const [startAt, endAt, leaveTypeId, isCompLeave, balanceMinute] = form.watch([
    "startAt",
    "endAt",
    "leaveTypeId",
    "isCompLeave",
    "balanceMinute",
  ]);
  useEffect(() => {
    const getLeaveHours = () => {
      if (!startAt || !endAt) return null;

      return calculateLeaveHours(
        (startAt as Date).toISOString(),
        (endAt as Date).toISOString(),
      );
    };

    form.setValue("hours", getLeaveHours() ?? 0, {
      shouldValidate: true,
    });
  }, [startAt, endAt]);

  useEffect(() => {
    const checkIsCompLeave = () => {
      if (!leaveTypeId || !leaveTypes) return false;
      return (
        leaveTypes.find((type) => type.code === "COMP")?.id === leaveTypeId
      );
    };
    form.setValue("isCompLeave", checkIsCompLeave(), { shouldValidate: true });
    form.trigger("hours");
  }, [leaveTypeId, leaveTypes]);

  useEffect(() => {
    if (open && employee) {
      getBalance(employee.id)
        .then((result) => {
          form.setValue("balanceMinute", result?.balanceMinutes ?? 0);
        })
        .catch((e) => {
          console.error("Failed to get balance", e);
          form.setValue("balanceMinute", 0);
        });
    }
  }, [open, employee]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="sm:min-w-[480px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "New" : "Edit"} Leave Request
          </SheetTitle>
          <SheetDescription>
            Employee: {employee?.fullName ?? "N/A"}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mx-4 mb-4">
              <CustomFormField
                required
                type="select"
                control={form.control}
                options={(leaveTypes ?? []).map((type) => ({
                  label: type.name,
                  value: type.id,
                }))}
                name="leaveTypeId"
                label="Leave Type"
                placeholder="Leave Type"
                fieldClassName="mb-4"
              />
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem className="mb-4 flex flex-col">
                    <CustomFormLabel required label="Start At" />
                    <CustomDatePicker
                      withTime
                      placeholder="Start At"
                      value={field.value as Date | undefined}
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
                    <CustomDatePicker
                      withTime
                      placeholder="End At"
                      value={field.value as Date | undefined}
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
                name="hours"
                label={`Hours ${isCompLeave ? `(Compensatory Leave Balance: ${(balanceMinute / 60).toFixed(2)} hours)` : ""}`}
                fieldClassName="mb-4"
              />
              <CustomFormField
                type="textarea"
                control={form.control}
                name="reason"
                label="Reason"
                placeholder="Reason for leave request"
                fieldClassName="mb-4"
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

export default EditLeaveDrawer;
