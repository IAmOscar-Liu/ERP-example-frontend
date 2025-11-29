import type { Employee, RoleDto } from "@/feature/employee/type";
import { noAuthAxios } from "@/hooks/useAxios";
import { manageProfile } from "@/lib/fetchProfile";
import { manageTokenRefresh } from "@/lib/refreshToken";
import { type ApiResponse } from "@/type";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  token: string | undefined;
  setToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentUser: Employee | null;
  userRoles: RoleDto[];
  login: (value: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [userRoles, setUserRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // await waitFor(1000); // Simulate loading delay
        const newAccessToken = await manageTokenRefresh({ setToken });
        await manageProfile({
          token: newAccessToken,
          setCurrentUser,
          setUserRoles,
        });
      } catch (error) {
        console.log(error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response = await noAuthAxios.post<
      ApiResponse<{ employee: Employee; roles: RoleDto[]; token: string }>
    >("/auth/login", { email, password });
    if (!response.data.success) throw new Error(response.data.message);

    setToken(response.data.data.token);
    setCurrentUser(response.data.data.employee);
    setUserRoles(response.data.data.roles);
  };

  const logout = () => {
    noAuthAxios.post("/auth/logout");
    queryClient.clear();
    setToken(undefined);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        currentUser,
        userRoles,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
