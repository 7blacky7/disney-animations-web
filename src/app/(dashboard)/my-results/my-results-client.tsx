"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

/**
 * My Results Client — Personal quiz history with animated score rings.
 *
 * Disney Principles:
 * - Staging: Score ring draws attention to each result
 * - Timing: Staggered reveals create flow
 * - Appeal: Clean, personal achievement view
 */

interface Result {
  id: string;
  quizId: string;
  score: number;
  maxScore: number;
  isPractice: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

interface MyResultsClientProps {
  results: Result[];
  hasData: boolean;
}

export function MyResultsClient({ results, hasData }: MyResultsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const completedResults = results.filter((r) => r.completedAt !== null);
  const totalAttempts = completedResults.length;
  const avgScore = totalAttempts > 0
    ? Math.round(
        completedResults.reduce((sum, r) => sum + (r.maxScore > 0 ? Math.min((r.score / r.maxScore) * 100, 100) : 0), 0) / totalAttempts,
      )
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.min(Math.max(...completedResults.map((r) => r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0)), 100)
    : 0;

  const personalStats = [
    { label: "Quizzes gespielt", value: String(totalAttempts) },
    { label: "Durchschnitt", value: `${avgScore}%` },
    { label: "Beste Leistung", value: `${bestScore}%` },
    { label: "Uebungen", value: String(completedResults.filter((r) => r.isPractice).length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Meine Ergebnisse</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deine Quiz-Historie und Statistiken.</p>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um deine Ergebnisse zu sehen.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Personal overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personalStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                className="rounded-2xl border border-border/40 bg-card p-5 text-center"
              >
                <p className="font-heading text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Results list */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Letzte Ergebnisse</h2>
            {completedResults.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">Noch keine Ergebnisse. Spiele dein erstes Quiz!</p>
              </div>
            )}
            {completedResults.map((result, i) => {
              const scorePercent = result.maxScore > 0
                ? Math.min(Math.round((result.score / result.maxScore) * 100), 100)
                : 0;

              return (
                <motion.div
                  key={result.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-5 py-4"
                >
                  {/* Score circle */}
                  <div className={cn(
                    "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
                    scorePercent >= 80 ? "bg-success/10" : scorePercent >= 60 ? "bg-chart-3/10" : "bg-destructive/10",
                  )}>
                    <span className={cn(
                      "font-heading text-lg font-bold",
                      scorePercent >= 80 ? "text-success" : scorePercent >= 60 ? "text-chart-3" : "text-destructive",
                    )}>
                      {scorePercent}
                    </span>
                    {/* Ring */}
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-border/20" />
                      <motion.circle
                        cx="28" cy="28" r="24" fill="none" strokeWidth="3" strokeLinecap="round"
                        className={cn(
                          scorePercent >= 80 ? "text-success" : scorePercent >= 60 ? "text-chart-3" : "text-destructive",
                        )}
                        stroke="currentColor"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        initial={prefersReducedMotion ? false : { strokeDashoffset: 2 * Math.PI * 24 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - scorePercent / 100) }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.score}/{result.maxScore} Punkte
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {result.completedAt
                          ? new Date(result.completedAt).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                      {result.isPractice && (
                        <Badge variant="outline" className="text-[9px] bg-muted border-border/40">Uebung</Badge>
                      )}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-8 w-24 hidden sm:block overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: scorePercent / 100 }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "h-full origin-left rounded-full",
                        scorePercent >= 80 ? "bg-success" :
                        scorePercent >= 60 ? "bg-chart-3" :
                        "bg-destructive",
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
