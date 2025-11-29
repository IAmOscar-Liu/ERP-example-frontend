import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

export function CustomDatePicker({
  className,
  placeholder,
  withTime = false,
  withClear = false,
  value,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  withTime?: boolean;
  withClear?: boolean;
  value?: Date;
  onChange?: (value: Date | undefined) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange?.(selectedDate);
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string,
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? currentHours + 12 : currentHours - 12,
        );
      }
      onChange?.(newDate);
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              date && "pr-6!",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, withTime ? "yyyy/MM/dd hh:mm aa" : "yyyy/MM/dd")
            ) : (
              <span>
                {placeholder ?? (withTime ? "YYYY/MM/DD hh:mm" : "YYYY/MM/DD")}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        {withClear && date && !isOpen && (
          <X
            className="text-muted-foreground absolute top-[50%] right-2 size-3 -translate-y-[50%] transform cursor-pointer"
            onClick={() => {
              onChange?.(undefined);
              setDate(undefined);
            }}
          />
        )}
      </div>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
          />
          {withTime && (
            <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {hours.reverse().map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() % 12 === hour % 12
                          ? "default"
                          : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="">
                <div className="flex p-2 sm:flex-col">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
