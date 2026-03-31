"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { createDepartment } from "@/lib/actions/user-actions";

/**
 * Departments Client — Phase 3: Abteilungs-CRUD
 * Connected to Server Actions for department management.
 */

interface Department {
  id: string;
  name: string;
  tenantId: string;
}

interface DepartmentsClientProps {
  initialDepartments: Department[];
  hasData: boolean;
}

export function DepartmentsClient({ initialDepartments, hasData }: DepartmentsClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [departments, setDepartments] = useState(initialDepartments);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const dept = await createDepartment(newName.trim());
        setDepartments((prev) => [...prev, dept]);
        setShowCreate(false);
        setNewName("");
      } catch {
        // Handle error
      }
    });
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
        <AnimatedButton shine onClick={() => setShowCreate(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          Neue Abteilung
        </AnimatedButton>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um Abteilungen zu verwalten.
          </p>
        </div>
      )}

      {/* Department Cards */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
              className="group rounded-2xl border border-border/40 bg-card p-5 transition-shadow duration-200 hover:shadow-md hover:shadow-foreground/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading font-bold text-sm">
                  {dept.name.charAt(0)}
                </div>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold">{dept.name}</h3>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-xl sm:inset-x-auto"
            >
              <h2 className="font-heading text-lg font-bold">Neue Abteilung</h2>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Name</Label>
                  <Input id="dept-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="z.B. Entwicklung" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Abbrechen</Button>
                <AnimatedButton shine size="sm" onClick={handleCreate} disabled={isPending || !newName.trim()}>
                  {isPending ? "Wird erstellt..." : "Erstellen"}
                </AnimatedButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
