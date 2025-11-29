import useAxios from "@/hooks/useAxios";
import type { ApiPaginationResponse, ApiResponse } from "@/type";
import type {
  CancelLeaveRequest,
  CreateLeaveRequest,
  Leave,
  LeaveType,
  ReviewLeaveRequest,
  UpdateLeaveRequest,
} from "../type";

function useLeaveApi() {
  const axios = useAxios();

  const listLeaveTypes = async () => {
    return await axios
      .get<ApiResponse<LeaveType[]>>("/leave/types")
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const getLeave = async (id: string) => {
    return await axios.get<ApiResponse<Leave>>(`/leave/${id}`).then((res) => {
      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data;
    });
  };

  const listLeaves = async (filter: {
    employeeId?: string;
    status?: "draft" | "pending" | "approved" | "rejected" | "cancelled";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    return await axios
      .get<ApiPaginationResponse<Leave>>("/leave/list", { params: filter })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const listLeavesForEmployee = async (filter: {
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
        ApiPaginationResponse<Leave>
      >(`/leave/${employeeId}/list`, { params: extra })
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const createLeave = async (payload: CreateLeaveRequest) => {
    return await axios
      .post<ApiResponse<Leave>>("/leave", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const updateLeave = async (payload: UpdateLeaveRequest) => {
    const { id, ...extra } = payload;
    return await axios
      .put<ApiResponse<Leave>>(`/leave/update/${id}`, extra)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const cancelLeave = async (payload: CancelLeaveRequest) => {
    return await axios
      .put<ApiResponse<Leave>>("/leave/cancel", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  const reviewLeave = async (payload: ReviewLeaveRequest) => {
    return await axios
      .put<ApiResponse<Leave>>("/leave/review", payload)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  return {
    listLeaveTypes,
    getLeave,
    listLeaves,
    listLeavesForEmployee,
    createLeave,
    updateLeave,
    cancelLeave,
    reviewLeave,
  };
}

export default useLeaveApi;
