"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { createTenant, deleteTenant } from "@/lib/actions/tenant";
import { cn } from "@/lib/utils";

/**
 * Tenants Client — Super-Admin Tenant Management
 *
 * Features:
 * - Tenant-Liste mit User-Count
 * - Neuen Tenant anlegen (Name + Slug)
 * - Tenant loeschen
 *
 * Disney Principles: Staging (Table first), Timing (staggered rows),
 * Appeal (clean badges, color swatches)
 */

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  showLogoOnLanding: boolean;
  quizAttribution: "named" | "anonymous";
  createdAt: Date;
  userCount: number;
}

interface TenantsClientProps {
  initialTenants: Tenant[];
}

const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function TenantsClient({ initialTenants }: TenantsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [tenantsList, setTenantsList] = useState(initialTenants);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filteredTenants = tenantsList.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreate() {
    if (!newName.trim() || !newSlug.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const tenant = await createTenant({
          name: newName.trim(),
          slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        });
        setTenantsList((prev) => [
          { ...tenant, userCount: 0, showLogoOnLanding: false, quizAttribution: "anonymous" as const },
          ...prev,
        ]);
        setNewName("");
        setNewSlug("");
        setShowCreate(false);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleDelete(tenantId: string, tenantName: string) {
    if (!confirm(`Mandant "${tenantName}" wirklich loeschen? Alle Daten werden unwiderruflich geloescht!`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTenant(tenantId);
        setTenantsList((prev) => prev.filter((t) => t.id !== tenantId));
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setNewName(name);
    setNewSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Mandanten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tenantsList.length} Mandant{tenantsList.length !== 1 ? "en" : ""} auf der Plattform
          </p>
        </div>
        <AnimatedButton
          shine
          onClick={() => setShowCreate(!showCreate)}
          disabled={isPending}
        >
          {showCreate ? "Abbrechen" : "+ Neuer Mandant"}
        </AnimatedButton>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <motion.div
          initial={prefersReducedMotion ? false : { y: -10 }}
          animate={{ y: 0 }}
          transition={CARD_TRANSITION}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold">Neuen Mandanten anlegen</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Firmenname</Label>
              <Input
                id="tenant-name"
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z.B. Acme GmbH"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-slug">Slug (URL-freundlich)</Label>
              <Input
                id="tenant-slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="z.B. acme-gmbh"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <AnimatedButton shine onClick={handleCreate} disabled={isPending || !newName.trim() || !newSlug.trim()}>
              {isPending ? "Wird angelegt..." : "Mandant anlegen"}
            </AnimatedButton>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Mandanten suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tenant Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">User</TableHead>
              <TableHead className="text-center">Logo</TableHead>
              <TableHead className="text-center">Attribution</TableHead>
              <TableHead>Farbe</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {search ? "Keine Mandanten gefunden." : "Noch keine Mandanten angelegt."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{tenant.slug}</code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{tenant.userCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={tenant.showLogoOnLanding ? "default" : "outline"}>
                      {tenant.showLogoOnLanding ? "Sichtbar" : "Versteckt"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={tenant.quizAttribution === "named" ? "default" : "outline"}>
                      {tenant.quizAttribution === "named" ? "Mit Firma" : "Anonym"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border/40"
                        style={{ backgroundColor: tenant.primaryColor ?? "#4338ca" }}
                      />
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border/40"
                        style={{ backgroundColor: tenant.accentColor ?? "#d97706" }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tenant.id, tenant.name)}
                      disabled={isPending}
                    >
                      Loeschen
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
