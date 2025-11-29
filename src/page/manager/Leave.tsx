import PaginationController from "@/components/table/PaginationController";
import { ReadOnlyTable } from "@/components/table/ReadOnlyTable";
import TableLayout from "@/components/table/TableLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import DialogProvider from "@/context/DialogProvider";
import useLeaveApi from "@/feature/leave/api";
import LeaveSearch from "@/feature/leave/components/LeaveSearch";
import ReviewLeaveDialog from "@/feature/leave/components/ReviewLeaveDialog";
import type { Leave } from "@/feature/leave/type";
import { usePaginationData } from "@/hooks/usePaginationData";
import { cn, toDateTimeString } from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVerticalIcon, SquareCheckBigIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

function LeaveManagementPage() {
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
        title: t({ id: "MENU.MANAGER_MNG" }),
        isSeparator: false,
        isActive: false,
      },
    ],
    [],
  );

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Leave Management</PageTitle>

      <main className="mx-8 my-6">
        <DialogProvider>
          <LeaveTable />
        </DialogProvider>
      </main>
    </>
  );
}

function LeaveTable({ className }: { className?: string }) {
  const [queryValue, updateQueryValue] = usePaginationData({
    status: "pending",
  });
  const { listLeaves } = useLeaveApi();
  const {
    data: leaveData,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.LeaveManagement, queryValue],
    queryFn: () =>
      listLeaves({
        employeeId: queryValue.employeeId,
        page: queryValue.page,
        limit: queryValue.limit,
        status: queryValue.status as Leave["status"] | undefined,
        from: queryValue.from,
        to: queryValue.to,
      }),
    // enabled: !!currentUser?.id,
    staleTime: STALE_TIME.LeaveManagement,
  });
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | undefined>(
    undefined,
  );
  const selectedLeave = useMemo(() => {
    if (!leaveData || !selectedLeaveId) return undefined;
    return leaveData.items.find((item) => item.id === selectedLeaveId);
  }, [leaveData, selectedLeaveId]);

  const [isReviewLeaveDrawerOpen, setIsReviewLeaveDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="me-auto text-2xl">Leave Management</h1>
      </div>

      <div className="mt-4 flex w-full">
        <LeaveSearch
          className="me-auto"
          queryValue={queryValue}
          updateQueryValue={updateQueryValue}
          withEmployee
        />
      </div>

      <ReviewLeaveDialog
        open={isReviewLeaveDrawerOpen}
        setOpen={setIsReviewLeaveDrawerOpen}
        leave={selectedLeave}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.Leave],
          });
        }}
      />

      <div className="mt-4 flex h-full flex-col rounded-2xl border px-6 pt-4 shadow-md">
        <TableLayout>
          {isFetching ? (
            <TableLayout.Loading />
          ) : error ? (
            <TableLayout.Error error={error} />
          ) : (
            <TableLayout.Body>
              {(leaveData?.items ?? []).length === 0 && <TableLayout.NoData />}
              {(leaveData?.items ?? []).length > 0 && (
                <ReadOnlyTable
                  data={leaveData?.items ?? []}
                  columns={[
                    {
                      title: "Employee",
                      value: (v) => (
                        <div>
                          {v.employee?.fullName || "No name"}
                          <br />
                          <small>
                            {v.employee?.employeeNo || "No employee no."}
                          </small>
                        </div>
                      ),
                    },
                    {
                      title: "Leave Type",
                      value: (v) => v.leaveType?.name || "N/A",
                    },
                    {
                      title: "Start At",
                      value: (v) =>
                        toDateTimeString(new Date(v.startAt), {
                          withSecond: false,
                        }),
                    },
                    {
                      title: "End At",
                      value: (v) =>
                        toDateTimeString(new Date(v.endAt), {
                          withSecond: false,
                        }),
                    },
                    {
                      title: "Hours",
                      value: (v) => v.hours,
                    },
                    {
                      title: "Reason",
                      value: (v) => v.reason ?? "N/A",
                    },
                    {
                      title: "Status",
                      value: (v) => v.status,
                    },
                    {
                      title: "",
                      value: (v) => (
                        <LeaveItemMenu
                          data={v}
                          onReview={() => {
                            setSelectedLeaveId(v.id);
                            setIsReviewLeaveDrawerOpen(true);
                          }}
                        />
                      ),
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
                total: leaveData?.total,
                totalPages: leaveData?.totalPages,
              }}
              updateQueryValue={updateQueryValue}
            />
          )}
        </TableLayout>
      </div>
    </div>
  );
}

function LeaveItemMenu({
  className,
  data,
  onReview,
}: {
  className?: string;
  data: Leave;
  onReview: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="outline" size="icon" className="size-8">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="">
        <DropdownMenuItem
          disabled={data.status !== "pending"}
          onClick={onReview}
        >
          <SquareCheckBigIcon />
          Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LeaveManagementPage;
