import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface ReadOnlyTableColumnDef<T> {
  title: ReactNode | string;
  className?: string;
  value: (v: T, vIdx: number) => ReactNode | string;
  valueClick?: (v: T, vIdx: number) => void;
  disableClick?: (v: T, vIdx: number) => boolean;
}

function ReadOnlyTable<T>({
  data,
  columns,
  lastColumnAlignEnd = true,
}: {
  data: T[];
  columns: ReadOnlyTableColumnDef<T>[];
  lastColumnAlignEnd?: boolean;
}) {
  return (
    <div className="-m-1.5 overflow-x-auto">
      <div className="inline-block min-w-full p-1.5 align-middle">
        <div className="overflow-hidden">
          <table className="divide-secondary min-w-full divide-y">
            <thead>
              <tr>
                {columns.map(({ title }, cIdx) => (
                  <th
                    key={cIdx}
                    scope="col"
                    className={cn(
                      "bg-primary text-background px-2 py-2.5 text-start font-semibold",
                      { "rounded-s-md": cIdx === 0 },
                      {
                        "rounded-e-md text-end":
                          cIdx === columns.length - 1 && lastColumnAlignEnd,
                      },
                    )}
                  >
                    <div
                      className={cn(
                        "flex w-[max-content] items-center gap-2 text-xs",
                        {
                          "ms-auto":
                            cIdx === columns.length - 1 && lastColumnAlignEnd,
                        },
                      )}
                    >
                      {title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-secondary divide-y">
              {data.map((row, rIdx) => (
                <tr key={rIdx} className="odd:bg-primary/10">
                  {columns.map(
                    (
                      { value, valueClick, className = "", disableClick },
                      cIdx,
                    ) => (
                      <td
                        key={cIdx}
                        className={cn("px-2 py-3 text-sm", {
                          "text-end": cIdx === columns.length - 1,
                          "hover:text-muted-foreground cursor-pointer font-semibold":
                            (!disableClick || !disableClick(row, rIdx)) &&
                            !!value(row, rIdx) &&
                            !!valueClick,
                          [className]: !!className,
                        })}
                        onClick={() =>
                          (!disableClick || !disableClick(row, rIdx)) &&
                          value(row, rIdx) &&
                          valueClick &&
                          valueClick(row, rIdx)
                        }
                      >
                        {value(row, rIdx)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { ReadOnlyTable };
