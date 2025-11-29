import type { Employee, RoleDto } from "@/feature/employee/type";
import { noAuthAxios } from "@/hooks/useAxios";
import type { ApiResponse } from "@/type";

let fetchProfilePromise: Promise<void> | null = null;

export const manageProfile = async ({
  token,
  setCurrentUser,
  setUserRoles,
}: {
  token: string;
  setCurrentUser: (user: Employee | null) => void;
  setUserRoles: (roles: RoleDto[]) => void;
}): Promise<void> => {
  // If a fetchProfile is not already in progress, start one.
  if (!fetchProfilePromise) {
    fetchProfilePromise = new Promise(async (resolve, reject) => {
      try {
        const { data } = await noAuthAxios.post<
          ApiResponse<{ employee: Employee; roles: RoleDto[] }>
        >(
          // Using a base axios instance here avoids interceptor recursion
          "/auth/profile",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!data.success) throw new Error(data.message);

        setCurrentUser(data.data.employee);
        setUserRoles(data.data.roles);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        // Reset the promise whether it succeeded or failed.
        fetchProfilePromise = null;
      }
    });
  }

  return fetchProfilePromise;
};
