import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc as baseAdminAc } from "better-auth/plugins/admin/access";
import { defaultStatements as orgDefaultStatements, adminAc as orgAdminAc } from "better-auth/plugins/organization/access";

// Admin Plugin Permissions (System-level)
const adminStatement = {
  ...defaultStatements,
  busOperator: ["create", "read", "update", "delete", "approve"], // Manage operators
  system: ["configure", "audit", "backup"],
} as const;

export const adminAc = createAccessControl(adminStatement);

// Organization Plugin Permissions (Bus Operator Company level)
const orgStatement = {
  ...orgDefaultStatements,
  bus: ["create", "read", "update", "delete"],           // Manage buses
  route: ["create", "read", "update", "delete"],         // Manage routes
  schedule: ["create", "read", "update", "delete"],      // Manage schedules
  ticket: ["create", "read", "update", "cancel", "refund"], // Ticket operations
  report: ["view", "export"],                            // Access reports
  counter: ["manage", "assign"],                         // Counter management
  staff: ["create", "read", "update", "delete"],         // Manage staff
} as const;

export const orgAc = createAccessControl(orgStatement);

// Admin Plugin Roles
export const superAdmin = adminAc.newRole({
  ...baseAdminAc.statements,
  busOperator: ["create", "read", "update", "delete", "approve"],
  system: ["configure", "audit", "backup"],
});

// Organization Roles (for bus operator companies)
export const operatorAdmin = orgAc.newRole({
  ...orgAdminAc.statements,
  bus: ["create", "read", "update", "delete"],
  route: ["create", "read", "update", "delete"],
  schedule: ["create", "read", "update", "delete"],
  ticket: ["create", "read", "update", "cancel", "refund"],
  report: ["view", "export"],
  counter: ["manage", "assign"],
  staff: ["create", "read", "update", "delete"],
});

export const operatorManager = orgAc.newRole({
  bus: ["read", "update"],
  route: ["read", "update"],
  schedule: ["read", "update"],
  ticket: ["create", "read", "cancel", "refund"],
  report: ["view", "export"],
  counter: ["manage", "assign"],
  staff: ["read", "update"],
});

export const operatorStaff = orgAc.newRole({
  bus: ["read"],
  route: ["read"],
  schedule: ["read"],
  ticket: ["create", "read"],
  report: ["view"],
});

export const counterOwner = orgAc.newRole({
  counter: ["manage"],
  ticket: ["create", "read", "update", "cancel"],
  report: ["view", "export"],
});

export const counterStaff = orgAc.newRole({
  ticket: ["create", "read"],
  schedule: ["read"],
});

// Role string constants for type-safety throughout the app
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  OPERATOR_ADMIN: 'operatorAdmin',
  OPERATOR_MANAGER: 'operatorManager',
  OPERATOR_STAFF: 'operatorStaff',
  COUNTER_OWNER: 'counterOwner',
  COUNTER_STAFF: 'counterStaff',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}
