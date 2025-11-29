import { cn, extractErrorMessage } from "@/lib/utils";
import { AlertCircleIcon, Loader2Icon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../ui/button";

export function PageScreenLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-grow items-center justify-center gap-4",
        className,
      )}
    >
      <Loader2Icon size={36} className="text-primary animate-spin" />
      <h1 className="text-foreground text-2xl">Loading...</h1>
    </div>
  );
}

export function PageScreenError({
  className,
  error,
  retry,
}: {
  className?: string;
  error?: any;
  retry?: () => void;
}) {
  console.error("An error has been caught:", error);

  return (
    <div
      className={cn(
        "flex min-h-full flex-grow flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <AlertCircleIcon size={36} className="text-red-500" />
      <h1 className="text-primary text-2xl">Oops! Something went wrong</h1>
      {error && (
        <div className="text-foreground/70 max-w-md text-center text-sm">
          <pre>{extractErrorMessage(error)}</pre>
        </div>
      )}
      <Button
        onClick={() => {
          if (retry) return retry();
          window.location.reload();
        }}
      >
        <RefreshCcwIcon size={20} />
        Reload
      </Button>
    </div>
  );
}
