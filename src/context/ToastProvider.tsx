import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
} from "lucide-react";
import { createContext, type ReactNode, useContext } from "react";
import { toast, type ToasterProps } from "sonner";

type ToastData = {
  title: string;
  description?: string;
  duration?: number;
  className?: string;
};

type ToastContextType = {
  success: (value: ToastData) => string | number;
  info: (value: ToastData) => string | number;
  warning: (value: ToastData) => string | number;
  error: (value: ToastData) => string | number;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastProvider({
  children,
  position,
}: {
  children: ReactNode;
  position?: ToasterProps["position"];
}) {
  // 🔴 Error
  const error = ({
    title,
    description,
    duration = 5000,
    className,
  }: ToastData) =>
    toast(
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 text-red-500" size={20} />
        <div>
          <p className="text-sm font-semibold text-red-600">{title}</p>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>,
      {
        duration,
        className: cn(
          "border border-red-500 bg-red-50 text-red-800",
          className,
        ),
      },
    );

  // 🟡 Warning
  const warning = ({
    title,
    description,
    duration = 5000,
    className,
  }: ToastData) =>
    toast(
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="mt-0.5 text-yellow-500" size={20} />
        <div>
          <p className="text-sm font-semibold text-yellow-700">{title}</p>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>,
      {
        duration,
        className: cn(
          "border border-yellow-400 bg-yellow-50 text-yellow-800",
          className,
        ),
      },
    );

  // 🟢 Success
  const success = ({
    title,
    description,
    duration = 5000,
    className,
  }: ToastData) =>
    toast(
      <div className="flex items-start gap-3">
        <CheckCircle2Icon className="mt-0.5 text-green-500" size={20} />
        <div>
          <p className="text-sm font-semibold text-green-700">{title}</p>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>,
      {
        duration,
        className: cn(
          "border border-green-500 bg-green-50 text-green-800",
          className,
        ),
      },
    );

  // 🔵 Info
  const info = ({
    title,
    description,
    duration = 5000,
    className,
  }: ToastData) =>
    toast(
      <div className="flex items-start gap-3">
        <InfoIcon className="mt-0.5 text-blue-500" size={20} />
        <div>
          <p className="text-sm font-semibold text-blue-700">{title}</p>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>,
      {
        duration,
        className: cn(
          "border border-blue-500 bg-blue-50 text-blue-800",
          className,
        ),
      },
    );

  return (
    <ToastContext.Provider value={{ error, info, warning, success }}>
      {children}
      <Toaster position={position} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
