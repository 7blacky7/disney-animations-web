import { listDepartments } from "@/lib/actions/user-actions";
import { getSession } from "@/lib/auth/session";
import { DepartmentsClient } from "./departments-client";

/**
 * Departments Page — Phase 3: Abteilungs-CRUD
 * Server Component: Fetches departments from DB.
 */

async function fetchDepartments() {
  try {
    const session = await getSession();
    if (!session) return null;
    return await listDepartments();
  } catch {
    return null;
  }
}

export default async function DepartmentsPage() {
  const departments = await fetchDepartments();

  return (
    <DepartmentsClient
      initialDepartments={departments ?? []}
      hasData={departments !== null}
    />
  );
}
