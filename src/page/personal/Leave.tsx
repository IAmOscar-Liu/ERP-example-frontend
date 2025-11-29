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
import { useAuth } from "@/context/AuthProvider";
import DialogProvider, { useDialog } from "@/context/DialogProvider";
import { useToast } from "@/context/ToastProvider";
import useLeaveApi from "@/feature/leave/api";
import EditLeaveDrawer from "@/feature/leave/components/EditLeaveDrawer";
import LeaveSearch from "@/feature/leave/components/LeaveSearch";
import type { Leave } from "@/feature/leave/type";
import { usePaginationData } from "@/hooks/usePaginationData";
import { cn, extractErrorMessage, toDateTimeString } from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanIcon, EditIcon, MoreVerticalIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

function LeavePage() {
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
      <PageTitle breadcrumbs={breadcrumbs}>Leave</PageTitle>

      <main className="mx-8 my-6">
        <DialogProvider>
          <LeaveTable />
        </DialogProvider>
      </main>
    </>
  );
}

function LeaveTable({ className }: { className?: string }) {
  const [queryValue, updateQueryValue] = usePaginationData();
  const { currentUser } = useAuth();
  const { listLeavesForEmployee, cancelLeave } = useLeaveApi();
  const {
    data: leaveData,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.Leave,
      {
        employeeId: currentUser?.id,
        ...queryValue,
      },
    ],
    queryFn: () =>
      listLeavesForEmployee({
        employeeId: currentUser!.id,
        page: queryValue.page,
        limit: queryValue.limit,
        status: queryValue.status as Leave["status"] | undefined,
        from: queryValue.from,
        to: queryValue.to,
      }),
    enabled: !!currentUser?.id,
    staleTime: STALE_TIME.Leave,
  });
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | undefined>(
    undefined,
  );
  const selectedLeave = useMemo(() => {
    if (!leaveData || !selectedLeaveId) return undefined;
    return leaveData.items.find((item) => item.id === selectedLeaveId);
  }, [leaveData, selectedLeaveId]);

  const [isNewLeaveDrawerOpen, setIsNewLeaveDrawerOpen] = useState(false);
  const [isUpdateLeaveDrawerOpen, setIsUpdateLeaveDrawerOpen] = useState(false);
  const toast = useToast();
  const { reason } = useDialog();
  const { mutateAsync: handleCancelLeave, isPending: isCanceling } =
    useMutation({
      mutationFn: cancelLeave,
    });
  const queryClient = useQueryClient();

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="me-auto text-2xl">Leave List</h1>
      </div>

      <div className="mt-4 flex w-full">
        <LeaveSearch
          className="me-auto"
          queryValue={queryValue}
          updateQueryValue={updateQueryValue}
        />
        <Button
          className="self-end"
          onClick={() => setIsNewLeaveDrawerOpen(true)}
        >
          <Plus />
          New Leave
        </Button>
      </div>

      <EditLeaveDrawer
        mode="create"
        open={isNewLeaveDrawerOpen}
        setOpen={setIsNewLeaveDrawerOpen}
        employee={currentUser ?? undefined}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.LeaveManagement],
          });
        }}
      />
      <EditLeaveDrawer
        mode="update"
        data={selectedLeave}
        open={isUpdateLeaveDrawerOpen}
        setOpen={setIsUpdateLeaveDrawerOpen}
        employee={currentUser ?? undefined}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.LeaveManagement],
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
                          onUpdate={() => {
                            setSelectedLeaveId(v.id);
                            setIsUpdateLeaveDrawerOpen(true);
                          }}
                          onCancel={() => {
                            if (!currentUser || isCanceling) return;
                            reason({
                              title: "Confirm Cancellation",
                              message:
                                "Are you sure you want to cancel this leave request?",
                              reasonLabel: "Reason",
                              accept: (reason) =>
                                handleCancelLeave({
                                  leaveRequestId: v.id,
                                  approverEmployeeId: currentUser.id,
                                  decisionNote: reason,
                                })
                                  .then(() =>
                                    toast.success({
                                      title:
                                        "Leave request canceled successfully",
                                    }),
                                  )
                                  .catch((e) => {
                                    console.error(e);
                                    toast.error({
                                      title: "Failed to cancel leave request",
                                      description: extractErrorMessage(e),
                                    });
                                  })
                                  .finally(refetch),
                            });
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
  onUpdate,
  onCancel,
}: {
  className?: string;
  data: Leave;
  onUpdate: () => void;
  onCancel: () => void;
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
          onClick={onUpdate}
        >
          <EditIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500 hover:text-red-500!"
          disabled={data.status !== "pending"}
          onClick={onCancel}
        >
          <BanIcon className="text-red-500" />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LeavePage;
