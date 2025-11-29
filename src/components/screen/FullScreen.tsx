import STLogo from "@/assets/symptomtrace_logo.png";
import { useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, Loader2Icon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../ui/button";

export function FullScreenLoading() {
  const { currentTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <img
        src={STLogo}
        className={cn("w-[208px] object-contain", {
          invert: currentTheme === "dark",
        })}
        alt=""
      />

      <Loader2Icon size={40} className="text-primary animate-spin" />
    </div>
  );
}

export function FullScreenError({ error }: { error: any }) {
  console.error("An error has been caught:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <AlertCircleIcon size={60} className="text-red-500" />

      <h1 className="text-text-primary text-2xl">Oops! Something went wrong</h1>
      <Button onClick={() => window.location.reload()}>
        <RefreshCcwIcon size={20} />
        Reload
      </Button>
    </div>
  );
}
