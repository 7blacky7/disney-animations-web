"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Statistics Dashboard — Phase 7
 *
 * Views per role:
 * - Admin: Company-wide anonymized stats
 * - Department Lead: Non-anonymized stats for own quizzes
 * - User: Personal stats + history
 *
 * TODO: Connect to real data, add Recharts/shadcn Charts
 */

// Mock data
const OVERVIEW_STATS = [
  { label: "Quizzes gespielt", value: 156, trend: "+12%", up: true },
  { label: "Durchschnittl. Score", value: "78%", trend: "+3%", up: true },
  { label: "Aktive Benutzer", value: 48, trend: "+8", up: true },
  { label: "Abschlussrate", value: "92%", trend: "-2%", up: false },
];

interface QuizStat {
  title: string;
  plays: number;
  avgScore: number;
  completionRate: number;
  practiceRatio: number;
}

const MOCK_QUIZ_STATS: QuizStat[] = [
  { title: "Disney Animations Grundlagen", plays: 48, avgScore: 82, completionRate: 95, practiceRatio: 30 },
  { title: "Web-Performance Quiz", plays: 23, avgScore: 71, completionRate: 88, practiceRatio: 45 },
  { title: "TypeScript Advanced", plays: 15, avgScore: 65, completionRate: 80, practiceRatio: 60 },
];

interface PersonalResult {
  quiz: string;
  score: number;
  date: string;
  isPractice: boolean;
}

const MOCK_PERSONAL: PersonalResult[] = [
  { quiz: "Disney Animations Grundlagen", score: 92, date: "Heute", isPractice: false },
  { quiz: "Web-Performance Quiz", score: 78, date: "Gestern", isPractice: false },
  { quiz: "Disney Animations Grundlagen", score: 85, date: "Vor 2 Tagen", isPractice: true },
  { quiz: "TypeScript Advanced", score: 60, date: "Vor 3 Tagen", isPractice: true },
];

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Statistik</h1>
          <p className="mt-1 text-sm text-muted-foreground">Auswertungen und Ergebnisse.</p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v ?? "30d")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            <SelectItem value="all">Gesamt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
            className="rounded-2xl border border-border/40 bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
            <p className={cn("mt-1 text-xs font-medium", stat.up ? "text-green-600" : "text-destructive")}>
              {stat.trend} vs. Vorperiode
            </p>
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
          {MOCK_QUIZ_STATS.map((quiz, i) => (
            <motion.div
              key={quiz.title}
              initial={{ opacity: 0, y: 10 }}
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
              {/* Score bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${quiz.avgScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span className="font-medium text-primary">{quiz.avgScore}% Durchschnitt</span>
                <span>100%</span>
              </div>
            </motion.div>
          ))}

          {/* Chart placeholder */}
          <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
            <p className="text-sm text-muted-foreground/60">Verlaufs-Chart (Recharts) folgt</p>
          </div>
        </TabsContent>

        {/* Personal Results */}
        <TabsContent value="personal" className="space-y-3">
          {MOCK_PERSONAL.map((result, i) => (
            <motion.div
              key={`${result.quiz}-${result.date}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl font-heading text-sm font-bold",
                  result.score >= 80 ? "bg-green-500/10 text-green-600" :
                  result.score >= 60 ? "bg-chart-3/10 text-chart-3" :
                  "bg-destructive/10 text-destructive",
                )}>
                  {result.score}
                </div>
                <div>
                  <p className="text-sm font-medium">{result.quiz}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{result.date}</span>
                    {result.isPractice && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">Uebung</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-8 w-24 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "h-full rounded-full",
                    result.score >= 80 ? "bg-green-500" :
                    result.score >= 60 ? "bg-chart-3" :
                    "bg-destructive",
                  )}
                />
              </div>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
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
