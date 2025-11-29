import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QUERY_KEYS, STALE_TIME } from "@/constants";
import { useAuth } from "@/context/AuthProvider";
import useAttendanceApi from "@/feature/attendance/api";
import type { Attendance } from "@/feature/attendance/type";
import { toDateOnlyString } from "@/lib/utils";
import { PageTitle } from "@/router/context/PageData";
import type { PaginationResponse } from "@/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

function HomePage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const today = toDateOnlyString(new Date());
  const [direction, setDirection] = useState<"in" | "out">("in");
  const { clock, getEmployeeAttendance } = useAttendanceApi();
  const { data: attendanceData } = useQuery({
    queryFn: () =>
      getEmployeeAttendance({
        employeeId: currentUser!.id,
        fromDate: toDateOnlyString(new Date(today)),
        toDate: toDateOnlyString(new Date(today)),
      }),
    queryKey: [
      QUERY_KEYS.Attendance,
      { employeeId: currentUser?.id, workDate: today },
    ],
    enabled: !!currentUser?.id,
    staleTime: STALE_TIME.Attendance,
  });

  const attendanceToday = attendanceData?.items[0];
  const hasClockedIn = !!attendanceToday?.firstInAt;

  useEffect(() => {
    // If user has clocked in, default the action to "out"
    if (hasClockedIn) {
      setDirection("out");
    }
  }, [hasClockedIn]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ direction }: { direction: "in" | "out" }) =>
      clock({ employeeId: currentUser!.id, direction }),
    onMutate: async ({ direction }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.Attendance] });

      // Snapshot the previous value
      const previousAttendance = queryClient.getQueryData<
        PaginationResponse<Attendance>
      >([
        QUERY_KEYS.Attendance,
        { employeeId: currentUser?.id, workDate: today },
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<PaginationResponse<Attendance>>(
        [
          QUERY_KEYS.Attendance,
          { employeeId: currentUser?.id, workDate: today },
        ],
        (old) => {
          const newAttendance: Attendance = {
            id: "-1", // temporary ID
            employeeId: currentUser!.id,
            workDate: toDateOnlyString(new Date()),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "normal",
            firstInAt: old?.items[0]?.firstInAt ?? null,
            lastOutAt: old?.items[0]?.lastOutAt ?? null,
          };

          if (direction === "in") {
            newAttendance.firstInAt = new Date();
          } else {
            newAttendance.lastOutAt = new Date();
          }

          return {
            total: old?.total ?? 1,
            page: old?.page ?? 1,
            limit: old?.limit ?? 1,
            totalPages: old?.totalPages ?? 1,
            items: [newAttendance],
          };
        },
      );

      // Return a context object with the snapshotted value
      return { previousAttendance };
    },
    onError: (_err, _newTodo, context) => {
      // Rollback to the previous value on error
      queryClient.setQueryData(
        [
          QUERY_KEYS.Attendance,
          { employeeId: currentUser?.id, workDate: today },
        ],
        context?.previousAttendance,
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Attendance],
      });
    },
  });

  return (
    <>
      <PageTitle>Home</PageTitle>
      <main className="px-8 py-6">
        <Card className="mx-auto mt-12 max-w-md">
          <CardHeader>
            <CardTitle>Daily Clock</CardTitle>
            <CardDescription>
              Clock in and out for <b>{today}</b>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {hasClockedIn ? (
              <div className="mx-4 space-y-2 self-stretch">
                <div className="flex justify-between">
                  <p>Clock In</p>
                  {new Date(attendanceToday.firstInAt!).toLocaleTimeString()}
                </div>
                <div className="flex justify-between">
                  <p>Clock Out</p>
                  {attendanceToday.lastOutAt
                    ? new Date(attendanceToday.lastOutAt).toLocaleTimeString()
                    : "Not yet"}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                You haven't clocked in yet.
              </p>
            )}

            {hasClockedIn && (
              <RadioGroup
                className="flex gap-4"
                value={direction}
                onValueChange={(value: "in" | "out") => setDirection(value)}
              >
                <Label
                  htmlFor="in"
                  className="border-input flex cursor-pointer items-center space-x-2 rounded-md border bg-transparent px-4 py-2"
                >
                  <RadioGroupItem value="in" id="in" />
                  <span>Clock In</span>
                </Label>
                <Label
                  htmlFor="out"
                  className="border-input flex cursor-pointer items-center space-x-2 rounded-md border bg-transparent px-4 py-2"
                >
                  <RadioGroupItem value="out" id="out" />
                  <span>Clock Out</span>
                </Label>
              </RadioGroup>
            )}
            <Button
              size="lg"
              className="size-24 rounded-full"
              onClick={() => mutate({ direction })}
              disabled={isPending}
            >
              <Clock className="size-12" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default HomePage;
