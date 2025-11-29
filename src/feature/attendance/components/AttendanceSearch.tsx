import { CustomDatePicker } from "@/components/form/CustomDatePicker";
import CustomCombobox from "@/components/others/CustomCombobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import useEmployeeApi from "@/feature/employee/api";
import type { Employee } from "@/feature/employee/type";
import { cn, dateStringToDate, toDateOnlyString } from "@/lib/utils";
import type { SearchQueries } from "@/type";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

function AttendanceSearch({
  queryValue,
  updateQueryValue,
  className,
  withEmployee = false,
}: {
  queryValue: SearchQueries;
  updateQueryValue: (update: SearchQueries) => void;
  className?: string;
  withEmployee?: boolean;
}) {
  const { listEmployees } = useEmployeeApi();
  const { data: employeeData } = useQuery({
    queryKey: [QUERY_KEYS.Employee],
    queryFn: () => listEmployees(),
    enabled: withEmployee,
    staleTime: STALE_TIME.Employee,
  });

  const [employeeId, setEmployeeId] = useState<string | undefined>(
    queryValue.employeeId,
  );

  const [from, setFrom] = useState<Date | undefined>(
    queryValue.from
      ? (dateStringToDate(queryValue.from) ?? undefined)
      : undefined,
  );

  const [to, setTo] = useState<Date | undefined>(
    queryValue.to ? (dateStringToDate(queryValue.to) ?? undefined) : undefined,
  );

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (withEmployee) {
      updateQueryValue({
        employeeId,
        from: from ? toDateOnlyString(from) : undefined,
        to: to ? toDateOnlyString(to) : undefined,
        page: 1,
      });
    } else {
      updateQueryValue({
        from: from ? toDateOnlyString(from) : undefined,
        to: to ? toDateOnlyString(to) : undefined,
        page: 1,
      });
    }
  };

  const extractEmployeeById = (id?: string) => {
    if (!id) return { value: "all", label: "All" };
    const result = (employeeData ?? []).find((emp) => emp.id === id);
    return result
      ? { value: result.id, label: buildLabel(result) }
      : { value: "all", label: "All" };
  };

  const buildLabel = (emp: Employee) => {
    return (
      <div>
        {emp.fullName}
        <small className="text-muted-foreground ms-2">{emp.employeeNo}</small>
      </div>
    );
  };

  return (
    <form className={cn("flex gap-2", className)} onSubmit={handleSearchSubmit}>
      {withEmployee && (
        <div className="flex flex-col gap-2">
          <Label>Employee</Label>
          <CustomCombobox
            options={[
              { value: "all", label: "All" },
              ...(employeeData ?? []).map((emp) => ({
                value: emp.id,
                label: buildLabel(emp),
              })),
            ]}
            value={extractEmployeeById(employeeId)}
            onChange={(d) =>
              setEmployeeId(!d || d.value === "all" ? undefined : d.value)
            }
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Start Date</Label>
        <CustomDatePicker
          withClear
          placeholder="Enter start Date"
          value={from}
          onChange={setFrom}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>End Date</Label>
        <CustomDatePicker
          withClear
          placeholder="Enter End Date"
          value={to}
          onChange={setTo}
        />
      </div>

      <Button size="sm" className="ms-2 mt-auto">
        Search
      </Button>
    </form>
  );
}

export default AttendanceSearch;
