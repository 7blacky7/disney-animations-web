import { listUsers, listDepartments, listInvitations } from "@/lib/actions/user-actions";
import { getSession } from "@/lib/auth/session";
import { UsersClient } from "./users-client";

/**
 * User Management Page — Phase 3
 * Server Component: Fetches users, departments and invitations from DB.
 */

async function fetchData() {
  try {
    const session = await getSession();
    if (!session) return null;

    const [users, departments, invitations] = await Promise.allSettled([
      listUsers(),
      listDepartments(),
      listInvitations(),
    ]);

    return {
      users: users.status === "fulfilled" ? users.value : [],
      departments: departments.status === "fulfilled" ? departments.value : [],
      invitations: invitations.status === "fulfilled" ? invitations.value : [],
    };
  } catch {
    return null;
  }
}

export default async function UsersPage() {
  const data = await fetchData();

  return (
    <UsersClient
      initialUsers={data?.users ?? []}
      departments={data?.departments ?? []}
      hasData={data !== null}
    />
  );
}
