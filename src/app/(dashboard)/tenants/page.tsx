import { requireRouteAccess } from "@/lib/auth/session";
import { listAllTenants } from "@/lib/actions/tenant-actions";
import { TenantsClient } from "./tenants-client";

/**
 * Tenants — Super-Admin Tenant Management
 * Server Component: Fetches all tenants with user counts.
 * RBAC: Erfordert "super_admin"-Rolle.
 */
export default async function TenantsPage() {
  await requireRouteAccess("/tenants");

  const tenantList = await listAllTenants().catch(() => []);

  return <TenantsClient initialTenants={tenantList} />;
}
