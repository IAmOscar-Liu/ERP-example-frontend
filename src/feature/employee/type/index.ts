export type Employee = {
  id: string;
  userId: string;
  employeeNo: string;
  fullName: string;
  email: string;
  phone: string | null;
  hireDate: string;
  leaveDate: string | null;
  status: "active" | "onboarding" | "suspended" | "terminated";
  employmentType: "full_time" | "part_time" | "contractor" | "intern";
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  department: Department | null;
  position: Position | null;
  manager: Employee | null;
};

export interface Department {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  parentId: string | null;
  headEmployeeId: string | null;
}

export interface Position {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  level: number | null;
  description: string | null;
}

export type RoleDto = {
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
};

export type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  rolePermissions: RolePermissionDto[];
};

export type RolePermissionDto = {
  roleId: string;
  permissionId: string;
  createdAt: string;
  updatedAt: string;
  permission: Permission;
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  module: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeStats = {
  attendanceStats: {
    totalWorkdays: number;
    totalWorkHours: number;
  };
  leaveStats: {
    totalHours: number;
  };
  overtimeStats: {
    totalPlannedHours: number;
    totalApprovedHours: number;
  };
};
