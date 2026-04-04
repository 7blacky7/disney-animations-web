import { listUsers, listDepartments, listInvitations } from "@/lib/actions/user";
import { requireRouteAccess } from "@/lib/auth/session";
import { UsersClient } from "./users-client";

/**
 * User Management Page — Phase 3
 * Server Component: Fetches users, departments and invitations from DB.
 * RBAC: Erfordert mindestens "admin"-Rolle.
 */

export default async function UsersPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /users
  await requireRouteAccess("/users");

  // Sequential calls to avoid parallel getSession() issues in Next.js 16
  const userList = await listUsers().catch(() => []);
  const departmentList = await listDepartments().catch(() => []);
  const invitationList = await listInvitations().catch(() => []);

  return (
    <UsersClient
      initialUsers={userList}
      departments={departmentList}
      hasData={true}
    />
  );
}
