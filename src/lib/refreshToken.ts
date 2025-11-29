import axios from "axios";
import { API_BASE_URL } from "@/constants";
import type { ApiResponse } from "@/type";

/**
 * A promise that represents the token refresh process.
 * It's null if no refresh is in progress.
 */
let refreshTokenPromise: Promise<string> | null = null;

/**
 * Manages refreshing the authentication token.
 * It ensures that if multiple requests fail with a 401, only one request to
 * refresh the token is made. Other failed requests will wait for the new token.
 *
 * @param setToken - Function to update the token in the auth context.
 * @param logout - Function to log the user out if refresh fails.
 * @returns The new access token.
 */
export const manageTokenRefresh = async ({
  setToken,
  logout,
}: {
  setToken: (token: string) => void;
  logout?: () => void;
}): Promise<string> => {
  // If a refresh is not already in progress, start one.
  if (!refreshTokenPromise) {
    refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post<ApiResponse<{ token: string }>>(
          // Using a base axios instance here avoids interceptor recursion
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        );
        if (!data.success) throw new Error(data.message);

        setToken(data.data.token);
        resolve(data.data.token);
      } catch (error) {
        logout?.();
        reject(error);
      } finally {
        // Reset the promise whether it succeeded or failed.
        refreshTokenPromise = null;
      }
    });
  }

  return refreshTokenPromise;
};
