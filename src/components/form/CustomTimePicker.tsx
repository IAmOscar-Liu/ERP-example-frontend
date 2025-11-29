import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock8Icon } from "lucide-react";

const CustomTimePicker = ({
  className,
  placeholder,
  value,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
}) => {
  // return (
  //   <Input
  //     placeholder={placeholder}
  //     type="time"
  //     id="time-picker"
  //     step="60" // 60 seconds = 1 minute
  //     // defaultValue="08:30"
  //     value={value}
  //     onChange={(e) => {
  //       if (onChange) {
  //         const timeValue = e.target.value; // hh:mm
  //         onChange(timeValue);
  //       }
  //     }}
  //     className={cn(
  //       "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
  //       className,
  //     )}
  //   />
  // );

  return (
    <div className={cn("relative", className)}>
      <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
        <Clock8Icon className="size-4" />
        <span className="sr-only">User</span>
      </div>
      <Input
        type="time"
        id="time-picker"
        step="60"
        value={value}
        onChange={(e) => {
          if (onChange) {
            const timeValue = e.target.value; // hh:mm
            onChange(timeValue);
          }
        }}
        className="peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  );
};

export default CustomTimePicker;
