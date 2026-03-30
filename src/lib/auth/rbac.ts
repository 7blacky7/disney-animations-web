/**
 * RBAC — Role-Based Access Control
 *
 * Rollen-Hierarchie:
 * super_admin > admin > department_lead > user
 *
 * Jede hoehere Rolle hat alle Rechte der niedrigeren.
 */

export type UserRole = "super_admin" | "admin" | "department_lead" | "user";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  department_lead: 60,
  user: 40,
};

/**
 * Prueft ob eine Rolle mindestens das erforderliche Level hat.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Prueft ob ein User Super-Admin ist.
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

/**
 * Prueft ob ein User mindestens Admin ist.
 */
export function isAdmin(role: UserRole): boolean {
  return hasRole(role, "admin");
}

/**
 * Prueft ob ein User mindestens Abteilungsleiter ist.
 */
export function isDepartmentLead(role: UserRole): boolean {
  return hasRole(role, "department_lead");
}

/**
 * Routen-Berechtigungen — welche Rolle fuer welche Route noetig.
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole> = {
  "/tenants": "super_admin",
  "/users": "admin",
  "/departments": "admin",
  "/settings": "admin",
  "/stats": "department_lead",
  "/quizzes": "department_lead",
  "/my-results": "user",
  "/dashboard": "user",
};

/**
 * Prueft ob ein User Zugriff auf eine Route hat.
 */
export function canAccessRoute(userRole: UserRole, path: string): boolean {
  // Finde die passende Route-Permission
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  if (!matchingRoute) return true; // Keine Einschraenkung
  return hasRole(userRole, ROUTE_PERMISSIONS[matchingRoute]);
}
