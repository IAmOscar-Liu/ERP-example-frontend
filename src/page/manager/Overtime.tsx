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
import DialogProvider from "@/context/DialogProvider";
import useOvertimeApi from "@/feature/overtime/api";
import OvertimeSearch from "@/feature/overtime/components/OvertimeSearch";
import ReviewOvertimeDialog from "@/feature/overtime/components/ReviewOvertimeDialog";
import type { Overtime } from "@/feature/overtime/type";
import { usePaginationData } from "@/hooks/usePaginationData";
import { cn, toTimeOnlyString } from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVerticalIcon, SquareCheckBigIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

function OvertimeManagementPage() {
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
      <PageTitle breadcrumbs={breadcrumbs}>Overtime Management</PageTitle>

      <main className="mx-8 my-6">
        <DialogProvider>
          <OvertimeTable />
        </DialogProvider>
      </main>
    </>
  );
}

function OvertimeTable({ className }: { className?: string }) {
  const [queryValue, updateQueryValue] = usePaginationData({
    status: "pending",
  });
  const { currentUser } = useAuth();
  const { listOvertimes } = useOvertimeApi();
  const {
    data: overtimeData,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.Overtime, queryValue],
    queryFn: () =>
      listOvertimes({
        employeeId: queryValue.employeeId,
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

  const [isReviewOvertimeDrawerOpen, setIsReviewOvertimeDrawerOpen] =
    useState(false);
  const queryClient = useQueryClient();

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center gap-3">
        <h1 className="me-auto text-2xl">Overtime Management</h1>
      </div>

      <div className="mt-4 flex w-full">
        <OvertimeSearch
          className="me-auto"
          queryValue={queryValue}
          updateQueryValue={updateQueryValue}
          withEmployee
        />
      </div>

      <ReviewOvertimeDialog
        open={isReviewOvertimeDrawerOpen}
        setOpen={setIsReviewOvertimeDrawerOpen}
        data={selectedOvertime}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.Overtime],
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
                          onReview={() => {
                            setSelectedOvertimeId(v.id);
                            setIsReviewOvertimeDrawerOpen(true);
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
  onReview,
}: {
  className?: string;
  data: Overtime;
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

export default OvertimeManagementPage;
