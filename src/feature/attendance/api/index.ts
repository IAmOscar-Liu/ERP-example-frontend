import useAxios from "@/hooks/useAxios";
import { toDateOnlyString } from "@/lib/utils";
import type { ApiPaginationResponse, ApiResponse } from "@/type";
import type { Attendance } from "../type";

function useAttendanceApi() {
  const axios = useAxios();

  const clock = async ({
    employeeId,
    direction,
  }: {
    employeeId: string;
    direction: "in" | "out";
  }) => {
    return await axios
      .post<ApiResponse<void>>("/attendance/clock", { employeeId, direction })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return true;
      });
  };

  const getEmployeeAttendance = async ({
    employeeId,
    fromDate,
    toDate,
    page,
    limit,
  }: {
    employeeId: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return await axios
      .get<ApiPaginationResponse<Attendance>>(`/attendance/${employeeId}`, {
        params: {
          fromDate,
          toDate,
          page,
          limit,
        },
      })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const getAttendance = async (filter: {
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return await axios
      .get<ApiPaginationResponse<Attendance>>("/attendance/list", {
        params: filter,
      })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  return { clock, getEmployeeAttendance, getAttendance };
}

export default useAttendanceApi;
