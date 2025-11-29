import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIntl } from "react-intl";

type DialogInfo = {
  isOpen: boolean;
  title?: string;
  message?: string;
  accept?: () => void;
};

type ReasonDialogInfo = {
  isOpen: boolean;
  title?: string;
  message?: string;
  reasonLabel?: string;
  warning?: string;
  accept?: (reason: string) => void;
};

const DialogContext = createContext<{
  alert: (props: Omit<DialogInfo, "isOpen" | "accept">) => void;
  confirm: (props: Omit<DialogInfo, "isOpen">) => void;
  reason: (props: Omit<ReasonDialogInfo, "isOpen">) => void;
} | null>(null);

export const useDialog = () => {
  const value = useContext(DialogContext);
  if (!value) throw new Error("Cannot not access DialogContext");
  return value;
};

function DialogProvider({ children }: { children: ReactNode }) {
  const { formatMessage: t } = useIntl();

  const [alertDialogInfo, setAlertDialogInfo] = useState<
    Omit<DialogInfo, "accept"> | undefined
  >(undefined);
  const [confirmDialogInfo, setConfirmDialogInfo] = useState<
    DialogInfo | undefined
  >(undefined);
  const [reasonDialogInfo, setReasonDialogInfo] = useState<
    ReasonDialogInfo | undefined
  >(undefined);

  const alert = (props: Omit<DialogInfo, "isOpen">) => {
    setAlertDialogInfo({
      isOpen: true,
      ...props,
    });
  };

  const confirm = (props: Omit<DialogInfo, "isOpen">) => {
    setConfirmDialogInfo({
      isOpen: true,
      ...props,
    });
  };

  const reason = (props: Omit<ReasonDialogInfo, "isOpen">) => {
    setReasonDialogInfo({
      isOpen: true,
      ...props,
    });
  };

  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <DialogContext.Provider value={{ alert, confirm, reason }}>
      {children}

      {/** Alert Dialog  */}
      <Dialog
        open={alertDialogInfo?.isOpen ?? false}
        onOpenChange={() => setAlertDialogInfo(undefined)}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {alertDialogInfo?.title || t({ id: "GENERAL.MESSAGE.INFO" })}
            </DialogTitle>
            <DialogDescription>
              {alertDialogInfo?.message ||
                t({ id: "GENERAL.MESSAGE.ARE_YOU_SURE" })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAlertDialogInfo(undefined)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Confirm Dialog  */}
      <Dialog
        open={confirmDialogInfo?.isOpen ?? false}
        onOpenChange={() => setConfirmDialogInfo(undefined)}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {confirmDialogInfo?.title || t({ id: "GENERAL.MESSAGE.INFO" })}
            </DialogTitle>
            <DialogDescription>
              {confirmDialogInfo?.message ||
                t({ id: "GENERAL.MESSAGE.ARE_YOU_SURE" })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogInfo(undefined)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (confirmDialogInfo?.accept) confirmDialogInfo.accept();
                setConfirmDialogInfo(undefined);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Reason Dialog  */}
      <Dialog
        open={reasonDialogInfo?.isOpen ?? false}
        onOpenChange={() => {
          if (reasonTextareaRef.current) reasonTextareaRef.current.value = "";
          setReasonDialogInfo(undefined);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {reasonDialogInfo?.title || t({ id: "GENERAL.MESSAGE.INFO" })}
            </DialogTitle>
            <DialogDescription>
              {reasonDialogInfo?.message ||
                t({ id: "GENERAL.MESSAGE.ARE_YOU_SURE" })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 mb-4">
            <div className="mb-3 flex flex-col gap-2">
              <Label htmlFor="reason-dialog-reason">
                {reasonDialogInfo?.reasonLabel ||
                  t({ id: "GENERAL.MESSAGE.ARE_YOU_SURE" })}
              </Label>
              <Textarea
                ref={reasonTextareaRef}
                id="reason-dialog-reason"
                className="mb-2"
              ></Textarea>
            </div>

            {reasonDialogInfo?.warning && (
              <p className="text-red-500">{reasonDialogInfo.warning}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReasonDialogInfo(undefined)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (reasonDialogInfo?.accept)
                  reasonDialogInfo.accept(
                    reasonTextareaRef.current?.value || "",
                  );
                if (reasonTextareaRef.current)
                  reasonTextareaRef.current.value = "";
                setReasonDialogInfo(undefined);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}

export default DialogProvider;
