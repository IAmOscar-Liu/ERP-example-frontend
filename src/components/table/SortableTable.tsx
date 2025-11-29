import {
  ChevronDownIcon,
  ChevronUpIcon,
  LucideChevronsUpDown,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SearchQueries } from "@/type";

export interface SortableTableColumnDef<T> {
  title: ReactNode | string;
  className?: string;
  value: (v: T, vIdx: number) => ReactNode | string;
  valueClick?: (v: T, vIdx: number) => void;
  disableClick?: (v: T, vIdx: number) => boolean;
  sortKey?: string;
}

function SortableTable<T>({
  searchQuery,
  updateQueryValue,
  data,
  columns,
  lastColumnAlignEnd = true,
}: {
  searchQuery: SearchQueries;
  updateQueryValue: (update: SearchQueries) => void;
  data: T[];
  columns: SortableTableColumnDef<T>[];
  lastColumnAlignEnd?: boolean;
}) {
  const [sortInfo, setSortInfo] = useState<
    | {
        key: string;
        order: "asc" | "desc" | "none";
      }
    | undefined
  >(undefined);

  useEffect(() => {
    const key = searchQuery.sortBy;
    const order =
      searchQuery.sortDesc === true
        ? "desc"
        : searchQuery.sortDesc === false
          ? "asc"
          : undefined;
    // console.log("useEffect: ", { key, order });

    if (!key) setSortInfo(undefined);
    else if (order !== "asc" && order !== "desc") setSortInfo(undefined);
    else setSortInfo({ key, order });
  }, [searchQuery]);

  const sortFn = (key: string) => {
    if (key !== sortInfo?.key) {
      setSortInfo({ key, order: "asc" });
      updateQueryValue({ sortBy: key, sortDesc: false });
    } else {
      if (sortInfo.order === "asc") {
        setSortInfo({ key, order: "desc" });
        updateQueryValue({ sortBy: key, sortDesc: true });
      } else if (sortInfo.order === "desc") {
        setSortInfo({ key, order: "none" });
        updateQueryValue({ sortBy: undefined, sortDesc: undefined });
      } else {
        setSortInfo({ key, order: "asc" });
        updateQueryValue({ sortBy: key, sortDesc: false });
      }
    }
  };

  const sortIcon = (key: string) => {
    if (sortInfo?.key == key && sortInfo.order === "asc")
      return <ChevronUpIcon className="w-3.5" />;
    if (sortInfo?.key == key && sortInfo.order === "desc")
      return <ChevronDownIcon className="w-3.5" />;
    return <LucideChevronsUpDown className="w-3" />;
  };

  return (
    <div className="-m-1.5 overflow-x-auto">
      <div className="inline-block min-w-full p-1.5 align-middle">
        <div className="overflow-hidden">
          <table className="divide-secondary min-w-full divide-y">
            <thead>
              <tr>
                {columns.map(({ title, sortKey }, cIdx) => (
                  <th
                    key={cIdx}
                    scope="col"
                    className={cn(
                      "bg-primary text-background px-2 py-2.5 text-start font-semibold",
                      { "cursor-pointer": !!sortKey },
                      { "rounded-s-md": cIdx === 0 },
                      {
                        "rounded-e-md text-end":
                          cIdx === columns.length - 1 && lastColumnAlignEnd,
                      },
                    )}
                    onClick={() => sortKey && sortFn(sortKey)}
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
                      {sortKey && sortIcon(sortKey)}
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

export { SortableTable };
