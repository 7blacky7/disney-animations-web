import { requireRouteAccess } from "@/lib/auth/session";

/**
 * Tenants — Placeholder Page
 * TODO: Implement in Phase t
 * RBAC: Erfordert "super_admin"-Rolle.
 */
export default async function TenantsPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /tenants
  await requireRouteAccess("/tenants");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Tenants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diese Seite wird in einer spaeteren Phase implementiert.
        </p>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm text-muted-foreground/60">Inhalt folgt</p>
      </div>
    </div>
  );
}
