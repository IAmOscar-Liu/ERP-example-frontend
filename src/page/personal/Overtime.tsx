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
import useOvertimeApi from "@/feature/overtime/api";
import EditOvertimeDrawer from "@/feature/overtime/components/EditOvertimeDrawer";
import OvertimeSearch from "@/feature/overtime/components/OvertimeSearch";
import type { Overtime } from "@/feature/overtime/type";
import { usePaginationData } from "@/hooks/usePaginationData";
import { cn, extractErrorMessage, toTimeOnlyString } from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanIcon, EditIcon, MoreVerticalIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

function OvertimePage() {
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
      <PageTitle breadcrumbs={breadcrumbs}>Overtime</PageTitle>

      <main className="mx-8 my-6">
        <DialogProvider>
          <OvertimeTable />
        </DialogProvider>
      </main>
    </>
  );
}

function OvertimeTable({ className }: { className?: string }) {
  const [queryValue, updateQueryValue] = usePaginationData();
  const { currentUser } = useAuth();
  const { listOvertimeForEmployee, cancelOvertime } = useOvertimeApi();
  const {
    data: overtimeData,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.Overtime,
      {
        employeeId: currentUser?.id,
        ...queryValue,
      },
    ],
    queryFn: () =>
      listOvertimeForEmployee({
        employeeId: currentUser!.id,
        page: queryValue.page,
        limit: queryValue.limit,
        status: queryValue.status as Overtime["status"] | undefined,
        from: queryValue.from,
        to: queryValue.to,
      }),
    enabled: !!currentUser?.id,
    staleTime: STALE_TIME.Overtime,
  });
  const [selectedOvertimeId, setSelectedOvertimeId] = useState<
    string | undefined
  >(undefined);
  const selectedOvertime = useMemo(() => {
    if (!overtimeData || !selectedOvertimeId) return undefined;
    return overtimeData.items.find((item) => item.id === selectedOvertimeId);
  }, [overtimeData, selectedOvertimeId]);

  const [isNewOvertimeDrawerOpen, setIsNewOvertimeDrawerOpen] = useState(false);
  const [isUpdateOvertimeDrawerOpen, setIsUpdateOvertimeDrawerOpen] =
    useState(false);
  const toast = useToast();
  const { reason } = useDialog();
  const { mutateAsync: handleCancelOvertime, isPending: isCanceling } =
    useMutation({
      mutationFn: cancelOvertime,
    });
  const queryClient = useQueryClient();

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="me-auto text-2xl">Overtime List</h1>
      </div>

      <div className="mt-4 flex w-full">
        <OvertimeSearch
          className="me-auto"
          queryValue={queryValue}
          updateQueryValue={updateQueryValue}
        />
        <Button
          className="self-end"
          onClick={() => setIsNewOvertimeDrawerOpen(true)}
        >
          <Plus />
          New Overtime
        </Button>
      </div>

      <EditOvertimeDrawer
        mode="create"
        open={isNewOvertimeDrawerOpen}
        setOpen={setIsNewOvertimeDrawerOpen}
        employee={currentUser ?? undefined}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.OvertimeManagement],
          });
        }}
      />
      <EditOvertimeDrawer
        mode="update"
        data={selectedOvertime}
        open={isUpdateOvertimeDrawerOpen}
        setOpen={setIsUpdateOvertimeDrawerOpen}
        employee={currentUser ?? undefined}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.OvertimeManagement],
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
              {(overtimeData?.items ?? []).length === 0 && (
                <TableLayout.NoData />
              )}
              {(overtimeData?.items ?? []).length > 0 && (
                <ReadOnlyTable
                  data={overtimeData?.items ?? []}
                  columns={[
                    {
                      title: "Work Date",
                      value: (v) => v.workDate,
                    },
                    {
                      title: "Start At",
                      value: (v) =>
                        toTimeOnlyString(new Date(v.startAt), {
                          withSecond: false,
                        }),
                    },
                    {
                      title: "End At",
                      value: (v) =>
                        toTimeOnlyString(new Date(v.endAt), {
                          withSecond: false,
                        }),
                    },
                    {
                      title: "Planned Hours",
                      value: (v) => v.plannedHours,
                    },
                    {
                      title: "Approved Hours",
                      value: (v) => v.approvedHours ?? "N/A",
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
                        <OvertimeItemMenu
                          data={v}
                          onUpdate={() => {
                            setSelectedOvertimeId(v.id);
                            setIsUpdateOvertimeDrawerOpen(true);
                          }}
                          onCancel={() => {
                            if (!currentUser || isCanceling) return;
                            reason({
                              title: "Confirm Cancellation",
                              message:
                                "Are you sure you want to cancel this overtime request?",
                              reasonLabel: "Reason",
                              accept: (reason) =>
                                handleCancelOvertime({
                                  overtimeRequestId: v.id,
                                  approverEmployeeId: currentUser.id,
                                  decisionNote: reason,
                                })
                                  .then(() =>
                                    toast.success({
                                      title:
                                        "Overtime request canceled successfully",
                                    }),
                                  )
                                  .catch((e) => {
                                    console.error(e);
                                    toast.error({
                                      title:
                                        "Failed to cancel overtime request",
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
                total: overtimeData?.total,
                totalPages: overtimeData?.totalPages,
              }}
              updateQueryValue={updateQueryValue}
            />
          )}
        </TableLayout>
      </div>
    </div>
  );
}

function OvertimeItemMenu({
  className,
  data,
  onUpdate,
  onCancel,
}: {
  className?: string;
  data: Overtime;
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

export default OvertimePage;
