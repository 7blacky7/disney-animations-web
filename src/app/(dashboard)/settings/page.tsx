import { getTenant } from "@/lib/actions/user";
import { requireRouteAccess } from "@/lib/auth/session";
import { SettingsClient } from "./settings-client";

/**
 * Settings Page — Tenant Branding + Mail + General Config
 * Server Component: Fetches tenant config from DB.
 * RBAC: Erfordert mindestens "admin"-Rolle.
 */

export default async function SettingsPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /settings
  await requireRouteAccess("/settings");

  const tenant = await getTenant().catch(() => null);

  return <SettingsClient tenant={tenant} />;
}
