import { getTenant } from "@/lib/actions/user-actions";
import { getSession } from "@/lib/auth/session";
import { SettingsClient } from "./settings-client";

/**
 * Settings Page — Tenant Branding + Mail + General Config
 * Server Component: Fetches tenant config from DB.
 */

async function fetchTenant() {
  try {
    const session = await getSession();
    if (!session) return null;
    return await getTenant();
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const tenant = await fetchTenant();

  return <SettingsClient tenant={tenant ?? null} />;
}
