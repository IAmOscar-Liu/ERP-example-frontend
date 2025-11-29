import useAxios from "@/hooks/useAxios";
import type { ApiResponse } from "@/type";
import type { CompTimeBalance } from "../type";

function useCompTimeApi() {
  const axios = useAxios();

  const getBalance = async (employId: string) => {
    return await axios
      .get<ApiResponse<CompTimeBalance | null>>(`/compTime/${employId}/balance`)
      .then((res) => {
        if (!res.data.success) throw new Error(res.data.message);
        return res.data.data;
      });
  };

  return { getBalance };
}

export default useCompTimeApi;
