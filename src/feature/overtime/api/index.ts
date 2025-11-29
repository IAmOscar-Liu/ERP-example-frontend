import useAxios from "@/hooks/useAxios";
import type { ApiPaginationResponse, ApiResponse } from "@/type";
import type {
  CancelOvertimeRequest,
  CreateOvertimeRequest,
  Overtime,
  ReviewOvertimeRequest,
  UpdateOvertimeRequest,
} from "../type";

function useOvertimeApi() {
  const axios = useAxios();

  const getOvertime = async (id: string) => {
    return await axios
      .get<ApiResponse<Overtime>>(`/overtime/${id}`)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const listOvertimes = async (filter: {
    employeeId?: string;
    status?: "draft" | "pending" | "approved" | "rejected" | "cancelled";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    return await axios
      .get<
        ApiPaginationResponse<Overtime>
      >("/overtime/list", { params: filter })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const listOvertimeForEmployee = async (filter: {
    employeeId: string;
    status?: "draft" | "pending" | "approved" | "rejected" | "cancelled";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const { employeeId, ...extra } = filter;
    return await axios
      .get<
        ApiPaginationResponse<Overtime>
      >(`/overtime/${employeeId}/list`, { params: extra })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const createOvertime = async (payload: CreateOvertimeRequest) => {
    return await axios
      .post<ApiResponse<Overtime>>("/overtime", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const updateOvertime = async (payload: UpdateOvertimeRequest) => {
    const { id, ...extra } = payload;
    return await axios
      .put<ApiResponse<Overtime>>(`/overtime/update/${id}`, extra)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const cancelOvertime = async (payload: CancelOvertimeRequest) => {
    return await axios
      .put<ApiResponse<Overtime>>("/overtime/cancel", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const reviewOvertime = async (payload: ReviewOvertimeRequest) => {
    return await axios
      .put<ApiResponse<Overtime>>("/overtime/review", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  return {
    getOvertime,
    listOvertimes,
    listOvertimeForEmployee,
    createOvertime,
    updateOvertime,
    cancelOvertime,
    reviewOvertime,
  };
}

export default useOvertimeApi;
