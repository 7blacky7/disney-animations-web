"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

/**
 * Statistics Client — Phase 7
 * Connected to real quiz stats and personal results.
 */

interface QuizStat {
  quizId: string;
  title: string;
  plays: number;
  avgScore: number;
  completionRate: number;
  practiceRatio: number;
}

interface PersonalResult {
  id: string;
  quizId: string;
  score: number;
  maxScore: number;
  isPractice: boolean;
  completedAt: Date | null;
  startedAt: Date;
}

interface StatsClientProps {
  quizStats: QuizStat[];
  personalResults: PersonalResult[];
  hasData: boolean;
}

export function StatsClient({ quizStats, personalResults, hasData }: StatsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [_timeRange, setTimeRange] = useState("30d");

  // Calculate overview KPIs from real data
  const totalPlays = quizStats.reduce((sum, q) => sum + q.plays, 0);
  const overallAvg = quizStats.length > 0
    ? Math.round(quizStats.reduce((sum, q) => sum + q.avgScore * q.plays, 0) / Math.max(totalPlays, 1))
    : 0;
  const completedResults = personalResults.filter((r) => r.completedAt !== null);

  const overviewStats = [
    { label: "Quizzes gespielt", value: totalPlays },
    { label: "Durchschnittl. Score", value: `${overallAvg}%` },
    { label: "Aktive Quizzes", value: quizStats.length },
    { label: "Meine Teilnahmen", value: completedResults.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Statistik</h1>
          <p className="mt-1 text-sm text-muted-foreground">Auswertungen und Ergebnisse.</p>
        </div>
        <select
          value={_timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-[140px] rounded-lg border border-border/40 bg-background px-3 py-2 text-sm"
        >
          <option value="7d">Letzte 7 Tage</option>
          <option value="30d">Letzte 30 Tage</option>
          <option value="90d">Letzte 90 Tage</option>
          <option value="all">Gesamt</option>
        </select>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um Statistiken zu sehen.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                className="rounded-2xl border border-border/40 bg-card p-5"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="quizzes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="quizzes">Quiz-Auswertungen</TabsTrigger>
              <TabsTrigger value="personal">Meine Ergebnisse</TabsTrigger>
            </TabsList>

            {/* Quiz Stats */}
            <TabsContent value="quizzes" className="space-y-4">
              {quizStats.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Noch keine Quiz-Daten vorhanden.</p>
                </div>
              )}
              {quizStats.map((quiz, i) => (
                <motion.div
                  key={quiz.quizId}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                  className="rounded-xl border border-border/40 bg-card p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-sm font-semibold">{quiz.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{quiz.plays}x gespielt</p>
                    </div>
                    <div className="flex gap-6">
                      <StatMini label="Score" value={`${quiz.avgScore}%`} />
                      <StatMini label="Abschluss" value={`${quiz.completionRate}%`} />
                      <StatMini label="Uebung" value={`${quiz.practiceRatio}%`} />
                    </div>
                  </div>
                  {/* Score bar — GPU-only via scaleX */}
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: quiz.avgScore / 100 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "left" }}
                      className="h-full w-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium text-primary">{quiz.avgScore}% Durchschnitt</span>
                    <span>100%</span>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            {/* Personal Results */}
            <TabsContent value="personal" className="space-y-3">
              {completedResults.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Noch keine persoenlichen Ergebnisse.</p>
                </div>
              )}
              {completedResults.map((result, i) => {
                const scorePercent = result.maxScore > 0
                  ? Math.round((result.score / result.maxScore) * 100)
                  : 0;

                return (
                  <motion.div
                    key={result.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl font-heading text-sm font-bold",
                        scorePercent >= 80 ? "bg-green-500/10 text-green-600" :
                        scorePercent >= 60 ? "bg-chart-3/10 text-chart-3" :
                        "bg-destructive/10 text-destructive",
                      )}>
                        {scorePercent}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.score}/{result.maxScore} Punkte</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {result.completedAt
                              ? new Date(result.completedAt).toLocaleDateString("de-DE")
                              : "—"}
                          </span>
                          {result.isPractice && (
                            <Badge variant="outline" className="text-[9px] bg-muted border-border/40">Uebung</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-8 w-24 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={prefersReducedMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: scorePercent / 100 }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: "left" }}
                        className={cn(
                          "h-full w-full rounded-full",
                          scorePercent >= 80 ? "bg-green-500" :
                          scorePercent >= 60 ? "bg-chart-3" :
                          "bg-destructive",
                        )}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-heading text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
