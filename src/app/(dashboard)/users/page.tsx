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

    // Sequential calls to avoid parallel getSession() issues in Next.js 16
    const userList = await listUsers().catch(() => []);
    const departmentList = await listDepartments().catch(() => []);
    const invitationList = await listInvitations().catch(() => []);

    return {
      users: userList,
      departments: departmentList,
      invitations: invitationList,
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
