"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";

/**
 * Quiz Manager Client — Phase 5
 * Connected to real quiz data from Server Actions.
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

interface QuizzesClientProps {
  initialQuizzes: Quiz[];
  hasData: boolean;
}

const MODE_LABELS: Record<string, string> = { realtime: "Echtzeit", async: "Asynchron" };
const VISIBILITY_LABELS: Record<string, string> = { global: "Oeffentlich", tenant: "Firmenintern", department: "Abteilung" };

export function QuizzesClient({ initialQuizzes, hasData }: QuizzesClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [search, setSearch] = useState("");

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <Link
              href={`/play/${quiz.id}`}
              className={cn(
                "mt-2 flex items-center justify-center gap-2 rounded-lg",
                "bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary",
                "transition-colors duration-200 hover:bg-primary/20",
              )}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M8 5v14l11-7z" />
              </svg>
              Spielen
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
