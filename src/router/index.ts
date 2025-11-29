import { PERMISSION } from "@/constants";
import LoginPage from "@/page/auth/Login";
import DashboardPage from "@/page/Dashboard";
import HomePage from "@/page/Home";
import AttendanceManagementPage from "@/page/manager/Attendance";
import LeaveManagementPage from "@/page/manager/Leave";
import OvertimeManagementPage from "@/page/manager/Overtime";
import AttendancePage from "@/page/personal/Attendance";
import LeavePage from "@/page/personal/Leave";
import OvertimePage from "@/page/personal/Overtime";
import UnauthorizedPage from "@/page/Unauthorized";
import { createBrowserRouter } from "react-router";
import { withAuth } from "./components/RequireAuth";
import AuthLayout from "./layout/AuthLayout";
import PrivateLayout from "./layout/PrivateLayout";
import RootLayout from "./layout/RootLayout";

export default createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        Component: AuthLayout,
        path: "auth",
        children: [
          {
            path: "login",
            Component: LoginPage,
          },
        ],
      },
      {
        Component: PrivateLayout,
        path: "/",
        children: [
          {
            index: true,
            Component: HomePage,
          },
          {
            path: "dashboard",
            Component: DashboardPage,
          },
          {
            path: "personal",
            children: [
              {
                path: "attendance",
                Component: AttendancePage,
              },
              {
                path: "leave",
                Component: LeavePage,
              },
              {
                path: "overtime",
                Component: OvertimePage,
              },
            ],
          },
          {
            path: "manager",
            children: [
              {
                path: "attendance",
                Component: withAuth(AttendanceManagementPage, [
                  PERMISSION.AttendanceView,
                ]),
              },
              {
                path: "leave",
                Component: withAuth(LeaveManagementPage, [
                  PERMISSION.LeaveReview,
                ]),
              },
              {
                path: "overtime",
                Component: withAuth(OvertimeManagementPage, [
                  PERMISSION.OvertimeReview,
                ]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/unauthorized",
    Component: UnauthorizedPage,
  },
]);
