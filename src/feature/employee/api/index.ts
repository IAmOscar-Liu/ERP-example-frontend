import { DAY_IN_MILLISECONDS } from "@/constants";
import useAxios from "@/hooks/useAxios";
import { dateStringToDate } from "@/lib/utils";
import type { ApiResponse } from "@/type";
import type { Employee, EmployeeStats } from "../type";

function useEmployeeApi() {
  const axios = useAxios();

  const listEmployees = async (
    filter: {
      departmentId?: string;
      status?: "active" | "onboarding" | "suspended" | "terminated";
      keyword?: string;
    } = {},
  ) => {
    return await axios
      .get<ApiResponse<Employee[]>>("/employee/list", {
        params: filter,
      })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const getEmployee = async (id: string) => {
    return await axios
      .get<ApiResponse<Employee>>(`/employee/${id}`)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const getEmployeeStats = async ({
    employeeId,
    fromDate,
    toDate,
  }: {
    employeeId: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const from = fromDate
      ? dateStringToDate(fromDate)?.toISOString()
      : undefined;
    let to = toDate;
    if (to) {
      const endDate = dateStringToDate(to);
      if (endDate) {
        to = new Date(
          +new Date(endDate) + DAY_IN_MILLISECONDS - 1,
        ).toISOString();
      }
    }

    return await axios
      .get<ApiResponse<EmployeeStats>>(`/employee/${employeeId}/stats`, {
        params: { from, to },
      })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  return { listEmployees, getEmployee, getEmployeeStats };
}

export default useEmployeeApi;
