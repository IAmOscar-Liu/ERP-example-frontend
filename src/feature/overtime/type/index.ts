import type { Employee } from "@/feature/employee/type";

export type CreateOvertimeRequest = {
  employeeId: string;
  workDate: string;
  startAt: string;
  endAt: string;
  plannedHours: number;
  status?:
    | "draft"
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | undefined;
  reason?: string | null | undefined;
  convertToCompTime?: boolean;
};

export type UpdateOvertimeRequest = CreateOvertimeRequest & { id: string };

export type Overtime = {
  employeeId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  workDate: string;
  reason?: string | null;
  approverEmployeeId?: string | null;
  decisionNote?: string | null;
  decidedAt?: Date | null;
  startAt: Date;
  endAt: Date;
  plannedHours: string;
  approvedHours?: string | null;
  convertToCompTime?: boolean;
  employee?: Employee | null;
  approver?: Employee | null;
};

export type CancelOvertimeRequest = {
  overtimeRequestId: string;
  approverEmployeeId: string;
  decisionNote?: string;
};

export type ReviewOvertimeRequest = {
  overtimeRequestId: string;
  approverEmployeeId: string;
  approve: boolean;
  decisionNote?: string;
  approvedHours?: number | null;
  convertToCompTime?: boolean;
};
