import CustomFormField from "@/components/form/CustomFormField";
import CustomLoadingButton from "@/components/form/CustomLoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { extractErrorMessage, toTimeOnlyString } from "@/lib/utils";
import type { DialogUpdateProps } from "@/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";
import useOvertimeApi from "../api";
import type { Overtime } from "../type";

const DEFAULT_FORM_VALUE = {
  decision: "approve" as "approve" | "reject",
  decisionNote: "",
  plannedHours: 0,
  approvedHours: 0,
};

function ReviewOvertimeDialog(
  props: DialogUpdateProps<Overtime> & { onSuccess?: () => void },
) {
  const { currentUser } = useAuth();
  const { data: overtime, open, setOpen, onSuccess } = props;
  const reviewData = overtime
    ? {
        ...DEFAULT_FORM_VALUE,
        plannedHours: Number(overtime.plannedHours),
        approvedHours: Number(overtime.plannedHours),
      }
    : undefined;
  const { formatMessage: t } = useIntl();
  const { reviewOvertime } = useOvertimeApi();
  const { mutateAsync: handleReviewOvertime } = useMutation({
    mutationFn: reviewOvertime,
  });

  const formSchema = useMemo(
    () =>
      z
        .object({
          decision: z.enum(["approve", "reject"]).default("approve"),
          decisionNote: z.string().optional(),
          plannedHours: z.number().optional(),
          approvedHours: z.number(t({ id: "general.validation.required" })),
        })
        .superRefine((data, ctx) => {
          if (data.decision === "approve") {
            if (data.approvedHours <= 0) {
              ctx.addIssue({
                code: "custom",
                message: "Approved hours must be greater than 0",
                path: ["approvedHours"],
              });
            }

            if (
              data.plannedHours !== undefined &&
              data.approvedHours > data.plannedHours
            ) {
              ctx.addIssue({
                code: "custom",
                message: "Approved Hours cannot be greater than Planned Hours",
                path: ["approvedHours"],
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
    defaultValues: reviewData ?? DEFAULT_FORM_VALUE,
  });

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    // console.log("Submitted:", value);
    if (!overtime?.employeeId || !currentUser) return;

    await handleReviewOvertime({
      overtimeRequestId: overtime.id,
      approverEmployeeId: currentUser.id,
      approve: value.decision === "approve",
      decisionNote: value.decisionNote,
      approvedHours: value.decision === "approve" ? value.approvedHours : null,
    })
      .then(() => {
        toast.success({
          title: "Overtime review submitted successfully",
        });
        if (onSuccess) onSuccess();
        setOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast.error({
          title: "Failed to submit overtime review",
          description: extractErrorMessage(e),
        });
      });
  };

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_FORM_VALUE, { keepDefaultValues: false });
    } else if (open && reviewData) {
      form.reset(reviewData, { keepDefaultValues: false });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Review Overtime</DialogTitle>
          <DialogDescription>
            Employee: {overtime?.employee?.fullName ?? "N/A"}
          </DialogDescription>
        </DialogHeader>

        {overtime && (
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <p>Work Date</p>
              <p>{overtime.workDate}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Period</p>
              <p>
                {toTimeOnlyString(new Date(overtime.startAt), {
                  withSecond: false,
                })}{" "}
                ~{" "}
                {toTimeOnlyString(new Date(overtime.endAt), {
                  withSecond: false,
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>Planned Hours</p>
              <p>{overtime.plannedHours}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Convert to Compensatory Leave</p>
              <p>{overtime.convertToCompTime ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mt-2 mb-4">
              <CustomFormField
                type="radio"
                control={form.control}
                name="decision"
                label="Decision"
                options={[
                  { label: "Approve", value: "approve" },
                  { label: "Reject", value: "reject" },
                ]}
                fieldClassName="mb-4"
              />
              <CustomFormField
                type="number"
                control={form.control}
                name="approvedHours"
                label="Approved Hours"
                fieldClassName="mb-4"
              />
              <CustomFormField
                type="number"
                control={form.control}
                className="hidden"
                disabled
                name="plannedHours"
              />
              <CustomFormField
                type="textarea"
                control={form.control}
                name="decisionNote"
                label="Decision Note"
                fieldClassName="mb-4"
              />
            </div>

            <DialogFooter>
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
                  disabled={
                    !form.formState.isValid ||
                    !overtime?.employeeId ||
                    !currentUser
                  }
                >
                  Submit
                </CustomLoadingButton>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewOvertimeDialog;
