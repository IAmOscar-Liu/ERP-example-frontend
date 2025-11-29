import { FullScreenLoading } from "@/components/screen/FullScreen";
import { useAuth } from "@/context/AuthProvider";
import { Outlet, Navigate, useLocation } from "react-router";

function RootLayout() {
  const { isLoading, isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) return <FullScreenLoading />;

  if (!isAuthenticated && !pathname.startsWith("/auth"))
    return <Navigate to="/auth/login" />;

  if (isAuthenticated && pathname.startsWith("/auth"))
    return <Navigate to="/" />;

  return <Outlet />;
}

export default RootLayout;
