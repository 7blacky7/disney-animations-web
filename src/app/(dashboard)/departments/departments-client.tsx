"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { createDepartment, deleteDepartment, renameDepartment } from "@/lib/actions/user";

interface Department {
  id: string;
  name: string;
  tenantId: string;
}

interface DepartmentsClientProps {
  initialDepartments: Department[];
  hasData: boolean;
}

type DialogState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "rename"; dept: Department }
  | { kind: "delete"; dept: Department };

export function DepartmentsClient({ initialDepartments, hasData }: DepartmentsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [departments, setDepartments] = useState(initialDepartments);
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setDialog({ kind: "create" });
    setName("");
    setError(null);
  }

  function openRename(dept: Department) {
    setDialog({ kind: "rename", dept });
    setName(dept.name);
    setError(null);
  }

  function openDelete(dept: Department) {
    setDialog({ kind: "delete", dept });
    setError(null);
  }

  function close() {
    setDialog({ kind: "none" });
    setName("");
    setError(null);
  }

  function handleSubmit() {
    if (dialog.kind === "create") {
      if (!name.trim()) return;
      startTransition(async () => {
        try {
          const dept = await createDepartment(name.trim());
          setDepartments((prev) => [...prev, dept]);
          close();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Erstellen fehlgeschlagen");
        }
      });
    } else if (dialog.kind === "rename") {
      const trimmed = name.trim();
      if (!trimmed || trimmed === dialog.dept.name) {
        close();
        return;
      }
      const id = dialog.dept.id;
      startTransition(async () => {
        try {
          const updated = await renameDepartment(id, trimmed);
          setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, name: updated.name } : d)));
          close();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Umbenennen fehlgeschlagen");
        }
      });
    } else if (dialog.kind === "delete") {
      const id = dialog.dept.id;
      startTransition(async () => {
        try {
          await deleteDepartment(id);
          setDepartments((prev) => prev.filter((d) => d.id !== id));
          close();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Abteilungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {departments.length} Abteilungen in Ihrer Organisation.
          </p>
        </div>
        <AnimatedButton shine onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          Neue Abteilung
        </AnimatedButton>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Melde dich an, um Abteilungen zu verwalten.</p>
        </div>
      )}

      {hasData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">Noch keine Abteilungen vorhanden.</p>
            </div>
          )}
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
              className="group relative rounded-2xl border border-border/40 bg-card p-5 transition-shadow duration-200 hover:shadow-md hover:shadow-foreground/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading font-bold text-sm">
                  {dept.name.charAt(0)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    data-testid={`dept-menu-${dept.id}`}
                    aria-label={`Aktionen für ${dept.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 data-[popup-open]:opacity-100"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <circle cx="12" cy="6" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="18" r="1.5" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => openRename(dept)}>Umbenennen</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => openDelete(dept)}
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold">{dept.name}</h3>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {dialog.kind !== "none" && (
          <Dialog onClose={close}>
            {dialog.kind === "delete" ? (
              <>
                <h2 className="font-heading text-lg font-bold">Abteilung löschen?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  &ldquo;{dialog.dept.name}&rdquo; wird unwiderruflich entfernt.
                </p>
                {error && <ErrorBanner message={error} />}
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={close} disabled={isPending}>Abbrechen</Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isPending}
                  >
                    {isPending ? "Lösche…" : "Löschen"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-heading text-lg font-bold">
                  {dialog.kind === "create" ? "Neue Abteilung" : "Abteilung umbenennen"}
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept-name">Name</Label>
                    <Input
                      id="dept-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="z.B. Entwicklung"
                      autoFocus
                    />
                  </div>
                  {error && <ErrorBanner message={error} />}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={close} disabled={isPending}>Abbrechen</Button>
                  <AnimatedButton shine size="sm" onClick={handleSubmit} disabled={isPending || !name.trim()}>
                    {isPending
                      ? dialog.kind === "create"
                        ? "Wird erstellt…"
                        : "Wird gespeichert…"
                      : dialog.kind === "create"
                        ? "Erstellen"
                        : "Speichern"}
                  </AnimatedButton>
                </div>
              </>
            )}
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dialog Wrapper — zentriert via left-1/2 + -translate-x-1/2 (mx-auto wirkt nicht bei position:fixed).
 */
function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { prefersReducedMotion } = useAccessibility();
  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-[20%] z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/50 bg-background p-6 shadow-xl"
      >
        {children}
      </motion.div>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
