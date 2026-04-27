// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "employee";

export type ScheduleStatus = "active" | "cancelled";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "ROLE_CHANGE";

export type AuditEntity = "users" | "schedules";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  locationName?: string;
  position?: string;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<User, "password">;

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  assignedToId: string;
  createdById: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  userId: string;
  createdAt: Date;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: Role;
  locationName?: string;
  position?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  locationName?: string;
  position?: string;
}

export interface CreateScheduleInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  assignedToId: string;
  createdById: string;
}

export interface UpdateScheduleInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  status?: ScheduleStatus;
}

export interface CreateAuditLogInput {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  userId: string;
}