"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { inviteUser } from "@/lib/actions/user";
import { cn } from "@/lib/utils";

/**
 * User Management Client Component — Phase 3
 *
 * Features:
 * - User table with role badges
 * - Invite dialog (single + bulk) connected to Server Actions
 * - Search/Filter
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "department_lead" | "user";
  departmentId: string | null;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Department {
  id: string;
  name: string;
}

interface UsersClientProps {
  initialUsers: User[];
  departments: Department[];
  hasData: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  department_lead: "Abteilungsleiter",
  user: "Benutzer",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  department_lead: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  user: "bg-muted text-muted-foreground border-border/40",
};

export function UsersClient({ initialUsers, departments, hasData }: UsersClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteMode, setInviteMode] = useState<"single" | "bulk">("single");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "department_lead" | "user">("user");
  const [inviteDept, setInviteDept] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function handleInvite() {
    startTransition(async () => {
      try {
        if (inviteMode === "single" && inviteEmail) {
          await inviteUser(inviteEmail, inviteRole, inviteDept || undefined);
        } else if (inviteMode === "bulk" && bulkEmails) {
          const emails = bulkEmails.split("\n").map((e) => e.trim()).filter(Boolean);
          for (const email of emails) {
            await inviteUser(email, "user");
          }
        }
        setShowInvite(false);
        setInviteEmail("");
        setBulkEmails("");
      } catch {
        // Handle error - will be shown in future toast system
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Benutzer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialUsers.length} Benutzer in Ihrer Organisation.
          </p>
        </div>
        <AnimatedButton shine onClick={() => setShowInvite(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          Einladen
        </AnimatedButton>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <Input
            placeholder="Suche nach Name oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um Benutzer zu verwalten.
          </p>
        </div>
      )}

      {/* User Table */}
      {hasData && (
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Benutzer</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Erstellt</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    {search ? "Keine Benutzer gefunden." : "Noch keine Benutzer vorhanden."}
                  </TableCell>
                </TableRow>
              )}
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", ROLE_COLORS[user.role])}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                      Aktiv
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {new Date(user.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Invite Dialog */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setShowInvite(false)}
            />
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl border border-border/50 bg-background p-6 shadow-xl sm:inset-x-auto"
            >
              <h2 className="font-heading text-lg font-bold">Benutzer einladen</h2>
              <p className="mt-1 text-sm text-muted-foreground">Laden Sie neue Benutzer per E-Mail ein.</p>

              {/* Mode toggle */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setInviteMode("single")}
                  className={cn("flex-1 rounded-lg border py-2 text-xs font-medium transition-all", inviteMode === "single" ? "border-primary/50 bg-primary/5 text-primary" : "border-border/40")}
                >
                  Einzeln
                </button>
                <button
                  onClick={() => setInviteMode("bulk")}
                  className={cn("flex-1 rounded-lg border py-2 text-xs font-medium transition-all", inviteMode === "bulk" ? "border-primary/50 bg-primary/5 text-primary" : "border-border/40")}
                >
                  Massen-Einladung
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {inviteMode === "single" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">E-Mail</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="name@firma.de"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Rolle</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "department_lead" | "user")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Benutzer</SelectItem>
                          <SelectItem value="department_lead">Abteilungsleiter</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-dept">Abteilung</Label>
                      <Select value={inviteDept} onValueChange={(v) => setInviteDept(v ?? "")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Abteilung waehlen" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="bulk-emails">E-Mail-Adressen (eine pro Zeile)</Label>
                    <Textarea
                      id="bulk-emails"
                      placeholder={"anna@firma.de\nmax@firma.de\nlisa@firma.de"}
                      rows={5}
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Alle eingeladenen Benutzer erhalten die Rolle &quot;Benutzer&quot;.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>
                  Abbrechen
                </Button>
                <AnimatedButton shine size="sm" onClick={handleInvite} disabled={isPending}>
                  {isPending ? "Wird gesendet..." : "Einladung senden"}
                </AnimatedButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
