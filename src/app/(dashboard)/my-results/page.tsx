"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * My Results — User's personal quiz history
 * Phase 7: Personal stats view
 * TODO: Connect to real data
 */

const PERSONAL_STATS = [
  { label: "Quizzes gespielt", value: "23" },
  { label: "Durchschnitt", value: "81%" },
  { label: "Beste Serie", value: "5" },
  { label: "Rang", value: "#3" },
];

interface Result {
  id: string;
  quiz: string;
  score: number;
  totalQuestions: number;
  correct: number;
  date: string;
  isPractice: boolean;
  duration: string;
}

const MOCK_RESULTS: Result[] = [
  { id: "1", quiz: "Disney Animations Grundlagen", score: 92, totalQuestions: 12, correct: 11, date: "Heute, 14:23", isPractice: false, duration: "4:32" },
  { id: "2", quiz: "Web-Performance Quiz", score: 78, totalQuestions: 8, correct: 6, date: "Gestern, 09:15", isPractice: false, duration: "3:18" },
  { id: "3", quiz: "Disney Animations Grundlagen", score: 85, totalQuestions: 12, correct: 10, date: "28.03, 16:40", isPractice: true, duration: "5:01" },
  { id: "4", quiz: "TypeScript Advanced", score: 60, totalQuestions: 15, correct: 9, date: "27.03, 11:05", isPractice: true, duration: "7:22" },
  { id: "5", quiz: "Web-Performance Quiz", score: 88, totalQuestions: 8, correct: 7, date: "26.03, 13:50", isPractice: false, duration: "2:45" },
];

export default function MyResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Meine Ergebnisse</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deine Quiz-Historie und Statistiken.</p>
      </div>

      {/* Personal overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONAL_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
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
        {MOCK_RESULTS.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-5 py-4"
          >
            {/* Score circle */}
            <div className={cn(
              "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
              result.score >= 80 ? "bg-green-500/10" : result.score >= 60 ? "bg-chart-3/10" : "bg-destructive/10",
            )}>
              <span className={cn(
                "font-heading text-lg font-bold",
                result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-chart-3" : "text-destructive",
              )}>
                {result.score}
              </span>
              {/* Ring */}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-border/20" />
                <motion.circle
                  cx="28" cy="28" r="24" fill="none" strokeWidth="3" strokeLinecap="round"
                  className={cn(
                    result.score >= 80 ? "text-green-500" : result.score >= 60 ? "text-chart-3" : "text-destructive",
                  )}
                  stroke="currentColor"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - result.score / 100) }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{result.quiz}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{result.correct}/{result.totalQuestions} richtig</span>
                <span className="text-xs text-muted-foreground">{result.duration} min</span>
                {result.isPractice && (
                  <Badge variant="outline" className="text-[9px] bg-muted border-border/40">Uebung</Badge>
                )}
              </div>
            </div>

            {/* Date */}
            <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">{result.date}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
