import { API_BASE_URL } from "@/constants";
import { useAuth } from "@/context/AuthProvider"; // Assuming this path is correct in your project structure
import { manageTokenRefresh } from "@/lib/refreshToken";
import axios, { AxiosError } from "axios";
import { useMemo } from "react";

/**
 * A custom React hook that returns a memoized Axios instance.
 * The instance is configured with a base URL and an interceptor to automatically
 * add the authentication token to requests. The instance is only recreated when the token changes.
 */
const useAxios = () => {
  // Get the token from your authentication context
  const { token, setToken, logout } = useAuth();

  // Memoize the Axios instance to avoid creating a new one on every render
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });
    // const instance = axios.create();

    // Use an interceptor to modify outgoing requests
    instance.interceptors.request.use(
      (config) => {
        // If a token exists, add it to the 'Authorization' header
        // before the request is sent
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // config.headers["MS-MODEL-SCRIPT"] = "MS_COLLABORATOR";
        // config.withCredentials = true;
        return config;
      },
      (error) => {
        // Handle any request errors
        return Promise.reject(error);
      },
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await manageTokenRefresh({ setToken, logout });
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        }
        return Promise.reject(error);
      },
    );

    return instance;
  }, [token]); // The dependency array ensures this only re-runs when the token changes

  // Return the configured and memoized Axios instance
  return axiosInstance;
};

export default useAxios;

export const noAuthAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
