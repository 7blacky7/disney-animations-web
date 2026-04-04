"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { createLearningPath, updateLearningPath, deleteLearningPath } from "@/lib/actions/learning-path-actions";
import { cn } from "@/lib/utils";

/**
 * Learning Paths Client — Lernpfad-Uebersicht + CRUD
 *
 * DeptLead/Admin: Erstellen, Bearbeiten, Veroeffentlichen, Loeschen
 * User: Durcharbeiten (Link zu einzelnem Lernpfad)
 */

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  levelCount: number;
}

interface LearningPathsClientProps {
  initialPaths: LearningPath[];
  userRole: string;
}

const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function LearningPathsClient({ initialPaths, userRole }: LearningPathsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [paths, setPaths] = useState(initialPaths);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLang, setNewLang] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canCreate = userRole === "department_lead" || userRole === "admin" || userRole === "super_admin";

  const filteredPaths = paths.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.language ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreate() {
    if (!newTitle.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const path = await createLearningPath({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          language: newLang.trim() || undefined,
        });
        setPaths((prev) => [
          { ...path, levelCount: 0 },
          ...prev,
        ]);
        setNewTitle("");
        setNewDesc("");
        setNewLang("");
        setShowCreate(false);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleTogglePublish(pathId: string, isPublished: boolean) {
    startTransition(async () => {
      try {
        await updateLearningPath(pathId, { isPublished: !isPublished });
        setPaths((prev) =>
          prev.map((p) => (p.id === pathId ? { ...p, isPublished: !isPublished } : p)),
        );
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function handleDelete(pathId: string, title: string) {
    if (!confirm(`Lernpfad "${title}" wirklich loeschen?`)) return;

    startTransition(async () => {
      try {
        await deleteLearningPath(pathId);
        setPaths((prev) => prev.filter((p) => p.id !== pathId));
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Lernpfade</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreate
              ? `${paths.length} Lernpfad${paths.length !== 1 ? "e" : ""} — erstelle und verwalte Lernmaterial`
              : `${paths.length} Lernpfad${paths.length !== 1 ? "e" : ""} zum Durcharbeiten`}
          </p>
        </div>
        {canCreate && (
          <AnimatedButton
            shine
            onClick={() => setShowCreate(!showCreate)}
            disabled={isPending}
          >
            {showCreate ? "Abbrechen" : "+ Neuer Lernpfad"}
          </AnimatedButton>
        )}
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
          <h2 className="font-heading text-lg font-semibold">Neuen Lernpfad erstellen</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="path-title">Titel</Label>
                <Input
                  id="path-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="z.B. JavaScript Grundlagen"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="path-lang">Sprache/Technologie</Label>
                <Input
                  id="path-lang"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  placeholder="z.B. JavaScript, Python, SQL"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="path-desc">Beschreibung (optional)</Label>
              <Textarea
                id="path-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Was lernt man in diesem Pfad?"
                rows={2}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <AnimatedButton shine onClick={handleCreate} disabled={isPending || !newTitle.trim()}>
              {isPending ? "Wird erstellt..." : "Lernpfad erstellen"}
            </AnimatedButton>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Lernpfade suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Path Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground/60">
              {search ? "Keine Lernpfade gefunden." : "Noch keine Lernpfade vorhanden."}
            </p>
          </div>
        ) : (
          filteredPaths.map((path, i) => (
            <motion.div
              key={path.id}
              initial={prefersReducedMotion ? false : { y: 15 }}
              animate={{ y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { ...CARD_TRANSITION, delay: i * 0.03 }}
            >
              <div className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </span>
                    <h3 className="font-heading text-sm font-semibold leading-tight">{path.title}</h3>
                  </div>
                  <Badge variant={path.isPublished ? "default" : "outline"}>
                    {path.isPublished ? "Live" : "Entwurf"}
                  </Badge>
                </div>

                {path.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{path.description}</p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-chart-2/10 px-2 py-0.5 text-[10px] font-medium text-chart-2">
                    {path.levelCount} Stufen
                  </span>
                  {path.language && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {path.language}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {canCreate ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(path.id, path.isPublished)}
                        disabled={isPending}
                      >
                        {path.isPublished ? "Zurueckziehen" : "Veroeffentlichen"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(path.id, path.title)}
                        disabled={isPending}
                      >
                        Loeschen
                      </Button>
                    </>
                  ) : (
                    <Link
                      href={`/play/${path.id}`}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg",
                        "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                        "transition-colors hover:bg-primary/90",
                      )}
                    >
                      Starten
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
