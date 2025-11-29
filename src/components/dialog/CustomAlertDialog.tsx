import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

function CustomAlertDialog({
  title,
  content,
  trigger,
  noStr,
  yesStr,
  onCancel,
  onAction,
}: {
  title: string | ReactNode;
  content: string | ReactNode;
  trigger?: ReactNode;
  noStr?: string;
  yesStr?: string;
  onCancel?: () => void;
  onAction?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? <Button variant="outline">Show Dialog</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {noStr || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>
            {yesStr || "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CustomAlertDialog;
