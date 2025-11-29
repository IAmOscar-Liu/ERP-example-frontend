import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "../ui/button";

function CustomLoadingButton({
  children,
  isLoading,
  className,
  disabled,
  onClick,
  ...rest
}: Parameters<typeof Button>[0] & { children: ReactNode; isLoading: boolean }) {
  return (
    <Button
      {...rest}
      onClick={onClick}
      className={cn("!py-0", className)}
      disabled={disabled || isLoading}
    >
      <div
        className={cn("relative flex size-full items-center justify-center", {
          "[&>*]:opacity-0": isLoading,
        })}
      >
        <div>{children}</div>
        {isLoading && (
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] !opacity-100">
            <Loader2Icon size={24} className="animate-spin" />
          </div>
        )}
      </div>
    </Button>
  );
}

export default CustomLoadingButton;
