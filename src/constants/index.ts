export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const THEME_STORAGE_KEY = "erp-example-web-ui-theme";
export const REMEMBER_ME_STORAGE_KEY = "erp-example-web-ui-remember-me";

export class QUERY_KEYS {
  static readonly Employee = "employee";
  static readonly EmployeeStats = "employeeStats";
  static readonly LeaveType = "LeaveType";

  static readonly Attendance = "Attendance";
  static readonly Leave = "Leave";
  static readonly Overtime = "Overtime";

  static readonly AttendanceManagement = "AttendanceManagement";
  static readonly LeaveManagement = "LeaveManagement";
  static readonly OvertimeManagement = "OvertimeManagement";
}

export class STALE_TIME {
  static readonly Employee = 60 * 60 * 1000; // 1 hour
  static readonly EmployeeStats = 60 * 60 * 1000; // 1 hour
  static readonly LeaveType = 60 * 60 * 1000; // 1 hour

  static readonly Attendance = 5 * 60 * 1000; // 5 minutes
  static readonly Leave = 5 * 60 * 1000; // 5 minutes
  static readonly Overtime = 5 * 60 * 1000; // 5 minutes

  static readonly AttendanceManagement = 5 * 60 * 1000; // 5 minutes
  static readonly LeaveManagement = 5 * 60 * 1000; // 5 minutes
  static readonly OvertimeManagement = 5 * 60 * 1000; // 5 minutes
}

export class PERMISSION {
  static readonly AttendanceView = "ATTENDANCE_VIEW";
  static readonly LeaveReview = "LEAVE_REVIEW";
  static readonly OvertimeReview = "OVERTIME_REVIEW";
}

export class PERMISSION_GROUP {
  static readonly Management = [
    PERMISSION.AttendanceView,
    PERMISSION.LeaveReview,
    PERMISSION.OvertimeReview,
  ];
}
