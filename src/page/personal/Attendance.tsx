import PaginationController from "@/components/table/PaginationController";
import { ReadOnlyTable } from "@/components/table/ReadOnlyTable";
import TableLayout from "@/components/table/TableLayout";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import { useAuth } from "@/context/AuthProvider";
import useAttendanceApi from "@/feature/attendance/api";
import AttendanceSearch from "@/feature/attendance/components/AttendanceSearch";
import { usePaginationData } from "@/hooks/usePaginationData";
import { cn, minuteToHourMinute, toTimeOnlyString } from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router";

function AttendancePage() {
  const { formatMessage: t } = useIntl();
  const breadcrumbs: Array<PageLink> = useMemo(
    () => [
      {
        title: t({ id: "MENU.HOME" }),
        path: "/",
        isSeparator: false,
        isActive: false,
      },
      {
        title: t({ id: "MENU.PERSONAL_MNG" }),
        isSeparator: false,
        isActive: false,
      },
    ],
    [],
  );

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Attendance</PageTitle>

      <main className="mx-8 my-6">
        <AttendanceTable />
      </main>
    </>
  );
}

function AttendanceTable({ className }: { className?: string }) {
  const [queryValue, updateQueryValue] = usePaginationData();
  const { currentUser } = useAuth();
  const { getEmployeeAttendance } = useAttendanceApi();
  const {
    data: attendanceData,
    isFetching,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.Attendance,
      {
        employeeId: currentUser?.id,
        ...queryValue,
      },
    ],
    queryFn: () =>
      getEmployeeAttendance({
        employeeId: currentUser!.id,
        page: queryValue.page,
        limit: queryValue.limit,
        fromDate: queryValue.from,
        toDate: queryValue.to,
      }),
    enabled: !!currentUser?.id,
    staleTime: STALE_TIME.Attendance,
  });

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="me-auto text-2xl">Daily Attendance</h1>
      </div>

      <div className="mt-4 flex w-full">
        <AttendanceSearch
          className="me-auto"
          queryValue={queryValue}
          updateQueryValue={updateQueryValue}
        />
        <Button className="self-end" asChild>
          <Link to="/">
            <Clock />
            Clock
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex h-full flex-col rounded-2xl border px-6 pt-4 shadow-md">
        <TableLayout>
          {isFetching ? (
            <TableLayout.Loading />
          ) : error ? (
            <TableLayout.Error error={error} />
          ) : (
            <TableLayout.Body>
              {(attendanceData?.items ?? []).length === 0 && (
                <TableLayout.NoData />
              )}
              {(attendanceData?.items ?? []).length > 0 && (
                <ReadOnlyTable
                  data={attendanceData?.items ?? []}
                  columns={[
                    {
                      title: "Work Date",
                      value: (v) => v.workDate,
                    },
                    {
                      title: "Clock In",
                      value: (v) =>
                        v.firstInAt
                          ? toTimeOnlyString(new Date(v.firstInAt))
                          : "N/A",
                    },
                    {
                      title: "Clock Out",
                      value: (v) =>
                        v.lastOutAt
                          ? toTimeOnlyString(new Date(v.lastOutAt))
                          : "N/A",
                    },
                    {
                      title: "Work Duration",
                      value: (v) =>
                        v.workMinutes
                          ? minuteToHourMinute(v.workMinutes)
                          : "N/A",
                    },
                    {
                      title: "OT. Duration",
                      value: (v) =>
                        v.overtimeMinutes
                          ? minuteToHourMinute(v.overtimeMinutes)
                          : "N/A",
                    },
                    {
                      title: "Status",
                      value: (v) => v.status,
                    },
                  ]}
                />
              )}
            </TableLayout.Body>
          )}
          {!isLoading && (
            <PaginationController
              paginationValue={{
                ...queryValue,
                total: attendanceData?.total,
                totalPages: attendanceData?.totalPages,
              }}
              updateQueryValue={updateQueryValue}
            />
          )}
        </TableLayout>
      </div>
    </div>
  );
}

export default AttendancePage;
