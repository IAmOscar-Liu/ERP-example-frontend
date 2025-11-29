import type { Employee } from "@/feature/employee/type";

export type LeaveType = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  category: "annual" | "sick" | "personal" | "unpaid" | "other";
  withPay: boolean;
  requiresProof: boolean;
  config: unknown;
};

export type CreateLeaveRequest = {
  employeeId: string;
  startAt: string;
  endAt: string;
  leaveTypeId: string;
  hours: number;
  status?:
    | "draft"
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | undefined;
  reason?: string | null | undefined;
};

export type UpdateLeaveRequest = CreateLeaveRequest & { id: string };

export type Leave = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  employeeId: string;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
  approverEmployeeId?: string | null;
  decisionNote?: string | null;
  decidedAt?: Date | null;
  leaveTypeId?: string;
  hours: string;
  attachments: unknown;
  employee?: Employee | null;
  leaveType?: LeaveType | null;
  approver?: Employee | null;
};

export type CancelLeaveRequest = {
  leaveRequestId: string;
  approverEmployeeId: string;
  decisionNote?: string;
};

export type ReviewLeaveRequest = {
  leaveRequestId: string;
  approverEmployeeId: string;
  approve: boolean;
  decisionNote?: string;
};
