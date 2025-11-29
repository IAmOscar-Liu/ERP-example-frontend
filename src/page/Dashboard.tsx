import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import { useAuth } from "@/context/AuthProvider";
import useEmployeeApi from "@/feature/employee/api";
import type { EmployeeStats } from "@/feature/employee/type";
import {
  dateStringToDate,
  formatHourDuration,
  getCurrentAndLastMonthBoundaries,
} from "@/lib/utils";
import { PageTitle, type PageLink } from "@/router/context/PageData";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseIcon,
  CalendarCheckIcon,
  HourglassIcon,
  UserCircle,
} from "lucide-react";
import { useMemo } from "react";

function DashboardPage() {
  const breadcrumbs: Array<PageLink> = useMemo(
    () => [
      {
        title: "Home",
        path: "/start",
        isSeparator: false,
        isActive: false,
      },
    ],
    [],
  );
  const { currentUser } = useAuth();
  const { getEmployeeStats } = useEmployeeApi();
  const statsBoundary = getCurrentAndLastMonthBoundaries();
  const { data: thisMonthStats } = useQuery({
    queryKey: [
      QUERY_KEYS.EmployeeStats,
      { employeeId: currentUser?.id, tag: "thisMonth" },
    ],
    queryFn: () =>
      getEmployeeStats({
        employeeId: currentUser!.id,
        from: dateStringToDate(
          statsBoundary.currentMonth.firstDay,
        )?.toISOString(),
        to: dateStringToDate(statsBoundary.currentMonth.lastDay)?.toISOString(),
      }),
    enabled: !!currentUser,
    staleTime: STALE_TIME.EmployeeStats,
  });
  const { data: lastMonthStats } = useQuery({
    queryKey: [
      QUERY_KEYS.EmployeeStats,
      { employeeId: currentUser?.id, tag: "lastMonth" },
    ],
    queryFn: () =>
      getEmployeeStats({
        employeeId: currentUser!.id,
        from: dateStringToDate(statsBoundary.lastMonth.firstDay)?.toISOString(),
        to: dateStringToDate(statsBoundary.lastMonth.lastDay)?.toISOString(),
      }),
    enabled: !!currentUser,
    staleTime: STALE_TIME.EmployeeStats,
  });

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Dashboard</PageTitle>

      <main className="mx-8 my-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {currentUser && <UserInfoCard user={currentUser} />}

        <div className="grid gap-6 md:grid-cols-2">
          {thisMonthStats && (
            <StatsCard title="This Month" stats={thisMonthStats} />
          )}
          {lastMonthStats && (
            <StatsCard title="Last Month" stats={lastMonthStats} />
          )}
        </div>
      </main>
    </>
  );
}

function UserInfoCard({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["currentUser"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="size-6" />
          Employee Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Full Name" value={user.fullName} />
          <InfoItem label="Employee No." value={user.employeeNo} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Department" value={user.department?.name} />
          <InfoItem label="Position" value={user.position?.name} />
          <InfoItem
            label="Employment Type"
            value={user.employmentType.replace("_", " ")}
          />
          <InfoItem label="Hire Date" value={user.hireDate} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value ?? "N/A"}</p>
    </div>
  );
}

type StatsCardProps = {
  title: string;
  stats: EmployeeStats;
};

function StatsCard({ title, stats }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BriefcaseIcon className="text-muted-foreground size-5" />
            <h3 className="font-semibold">Attendance</h3>
          </div>
          <div className="space-y-2 pl-7">
            <StatItem
              label="Total Workdays"
              value={stats.attendanceStats.totalWorkdays}
            />
            <StatItem
              label="Total Work Duration"
              value={formatHourDuration(stats.attendanceStats.totalWorkHours)}
            />
          </div>
        </div>

        {/* Leave */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarCheckIcon className="text-muted-foreground size-5" />
            <h3 className="font-semibold">Leave</h3>
          </div>
          <div className="space-y-2 pl-7">
            <StatItem label="Total Hours" value={stats.leaveStats.totalHours} />
          </div>
        </div>

        {/* Overtime */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HourglassIcon className="text-muted-foreground size-5" />
            <h3 className="font-semibold">Overtime</h3>
          </div>
          <div className="space-y-2 pl-7">
            <StatItem
              label="Planned Hours"
              value={stats.overtimeStats.totalPlannedHours.toFixed(2)}
            />
            <StatItem
              label="Approved Hours"
              value={stats.overtimeStats.totalApprovedHours.toFixed(2)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default DashboardPage;
