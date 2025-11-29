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
import { useToast } from "@/context/ToastProvider";
import type { DialogCreateProps } from "@/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import z from "zod";
import useLeaveApi from "../api";
import type { Leave } from "../type";
import { extractErrorMessage, toDateTimeString } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";

const DEFAULT_FORM_VALUE = {
  decision: "approve" as "approve" | "reject",
  decisionNote: "",
};

function ReviewLeaveDialog(
  props: DialogCreateProps & { leave?: Leave; onSuccess?: () => void },
) {
  const { currentUser } = useAuth();
  const { leave, open, setOpen, onSuccess } = props;
  const { reviewLeave } = useLeaveApi();
  const { mutateAsync: handleReviewLeave } = useMutation({
    mutationFn: reviewLeave,
  });

  const formSchema = useMemo(
    () =>
      z.object({
        decision: z.enum(["approve", "reject"]).default("approve"),
        decisionNote: z.string().optional(),
      }),
    [],
  );

  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    shouldUnregister: true,
    defaultValues: DEFAULT_FORM_VALUE,
  });

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    console.log("Submitted:", value);
    if (!leave?.employeeId || !currentUser) return;

    await handleReviewLeave({
      leaveRequestId: leave.id,
      approverEmployeeId: currentUser.id,
      approve: value.decision === "approve",
      decisionNote: value.decisionNote,
    })
      .then(() => {
        toast.success({
          title: "Leave review submitted successfully",
        });
        if (onSuccess) onSuccess();
        setOpen(false);
      })
      .catch((e) => {
        console.error(e);
        toast.error({
          title: "Failed to submit leave review",
          description: extractErrorMessage(e),
        });
      });
  };

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_FORM_VALUE, { keepDefaultValues: false });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Review Leave</DialogTitle>
          <DialogDescription>
            Employee: {leave?.employee?.fullName ?? "N/A"}
          </DialogDescription>
        </DialogHeader>

        {leave && (
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <p>Leave Type</p>
              <p>{leave.leaveType?.name ?? "N/A"}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Start At</p>
              <p>
                {toDateTimeString(new Date(leave.startAt), {
                  withSecond: false,
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>End At</p>
              <p>
                {toDateTimeString(new Date(leave.endAt), {
                  withSecond: false,
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>Hours</p>
              <p>{leave.hours}</p>
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
                    !leave?.employeeId ||
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

export default ReviewLeaveDialog;
