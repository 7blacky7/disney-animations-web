"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { assignQuiz } from "@/lib/actions/quiz-actions";
import { cn } from "@/lib/utils";

/**
 * Quiz Manager Client — Phase 5 + Quiz-Zuweisungen
 * Connected to real quiz data from Server Actions.
 * DeptLead/Admin kann Quizzes an User/Abteilungen zuweisen.
 */

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quizMode: "realtime" | "async";
  visibility: "global" | "tenant" | "department";
  isPublished: boolean;
  isPracticeAllowed: boolean;
  createdAt: Date;
}

interface Department {
  id: string;
  name: string;
}

interface QuizzesClientProps {
  initialQuizzes: Quiz[];
  departments?: Department[];
  hasData: boolean;
}

const MODE_LABELS: Record<string, string> = { realtime: "Echtzeit", async: "Asynchron" };
const VISIBILITY_LABELS: Record<string, string> = { global: "Oeffentlich", tenant: "Firmenintern", department: "Abteilung" };

export function QuizzesClient({ initialQuizzes, departments = [], hasData }: QuizzesClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [search, setSearch] = useState("");
  const [assigningQuizId, setAssigningQuizId] = useState<string | null>(null);
  const [assignDeptId, setAssignDeptId] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  function handleAssign(quizId: string) {
    if (!assignDeptId) return;
    setAssignError(null);
    setAssignSuccess(null);

    startTransition(async () => {
      try {
        await assignQuiz({
          quizId,
          departmentId: assignDeptId,
          dueDate: assignDueDate || undefined,
        });
        setAssignSuccess("Quiz erfolgreich zugewiesen!");
        setTimeout(() => {
          setAssigningQuizId(null);
          setAssignDeptId("");
          setAssignDueDate("");
          setAssignSuccess(null);
        }, 1500);
      } catch (err) {
        setAssignError((err as Error).message);
      }
    });
  }

  const filtered = initialQuizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{initialQuizzes.length} Quizzes erstellt.</p>
        </div>
        <Link href="/quizzes/new">
          <AnimatedButton shine>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
              <path d="M12 5v14m-7-7h14" />
            </svg>
            Neues Quiz
          </AnimatedButton>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <Input placeholder="Quiz suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um Quizzes zu verwalten.
          </p>
        </div>
      )}

      {hasData && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "Keine Quizzes gefunden." : "Noch keine Quizzes erstellt. Klicke auf \"Neues Quiz\" um loszulegen!"}
          </p>
        </div>
      )}

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((quiz, i) => (
          <motion.div
            key={quiz.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <Link
              href={`/quizzes/${quiz.id}/edit`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/[0.03] hover:border-border"
            >
              <div className="flex items-start justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    quiz.isPublished
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {quiz.isPublished ? "Veroeffentlicht" : "Entwurf"}
                </Badge>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{MODE_LABELS[quiz.quizMode]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{VISIBILITY_LABELS[quiz.visibility]}</Badge>
                </div>
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold group-hover:text-primary transition-colors">{quiz.title}</h3>
              {quiz.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{quiz.isPracticeAllowed ? "Uebung erlaubt" : "Nur Echt"}</span>
                <span className="ml-auto" suppressHydrationWarning>{new Date(quiz.createdAt).toLocaleDateString("de-DE")}</span>
              </div>
            </Link>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/play/${quiz.id}`}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg",
                  "bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary",
                  "transition-colors duration-200 hover:bg-primary/20",
                )}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Spielen
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  setAssigningQuizId(assigningQuizId === quiz.id ? null : quiz.id);
                  setAssignError(null);
                  setAssignSuccess(null);
                }}
              >
                Zuweisen
              </Button>
            </div>

            {/* Zuweisungs-Dialog */}
            {assigningQuizId === quiz.id && (
              <div className="mt-2 rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-3">
                <p className="text-xs font-semibold">Quiz an Abteilung zuweisen</p>
                {assignError && (
                  <p className="text-[10px] text-destructive">{assignError}</p>
                )}
                {assignSuccess && (
                  <p className="text-[10px] text-success">{assignSuccess}</p>
                )}
                <div className="space-y-2">
                  <Label className="text-[10px]">Abteilung</Label>
                  <select
                    value={assignDeptId}
                    onChange={(e) => setAssignDeptId(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs"
                    disabled={isPending}
                  >
                    <option value="">Abteilung waehlen...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">Faellig bis (optional)</Label>
                  <Input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="text-xs"
                    disabled={isPending}
                  />
                </div>
                <AnimatedButton
                  size="sm"
                  shine
                  onClick={() => handleAssign(quiz.id)}
                  disabled={isPending || !assignDeptId}
                >
                  {isPending ? "Wird zugewiesen..." : "Zuweisen"}
                </AnimatedButton>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
