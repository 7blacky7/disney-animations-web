import { listDepartments } from "@/lib/actions/user-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { DepartmentsClient } from "./departments-client";

/**
 * Departments Page — Phase 3: Abteilungs-CRUD
 * Server Component: Fetches departments from DB.
 * RBAC: Erfordert mindestens "admin"-Rolle.
 */

export default async function DepartmentsPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /departments
  await requireRouteAccess("/departments");

  const departments = await listDepartments().catch(() => []);

  return (
    <DepartmentsClient
      initialDepartments={departments}
      hasData={true}
    />
  );
}
