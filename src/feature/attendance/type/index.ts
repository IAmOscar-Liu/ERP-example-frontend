import type { Employee } from "@/feature/employee/type";

export type Attendance = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: "normal" | "late" | "early_leave" | "absent" | "exception";
  employeeId: string;
  workDate: string;
  plannedShiftTypeId?: string | null;
  firstInAt?: Date | null;
  lastOutAt?: Date | null;
  workMinutes?: number | null;
  overtimeMinutes?: number | null;
  exceptionReason?: string | null;
  planShiftType?: PlanShiftType | null;
  employee?: Employee | null;
};

export type PlanShiftType = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isNightShift: boolean;
  color?: string | null;
};
