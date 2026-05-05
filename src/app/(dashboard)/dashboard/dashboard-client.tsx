"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

/**
 * Dashboard Client — Animated KPI cards and activity feed
 *
 * Animation Principles:
 * - Staging: KPIs draw attention first, then activity
 * - Timing: Staggered card reveals
 * - Appeal: Clean, professional card design
 */

interface DashboardStats {
  activeQuizzes: number;
  totalUsers: number;
  completedAttempts: number;
  averageScore: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quizMode: string;
  visibility: string;
}

interface AssignedQuiz {
  assignmentId: string;
  quizId: string;
  title: string;
  description: string | null;
  quizMode: string;
  dueDate: Date | null;
  status: "pending" | "in_progress" | "completed" | "overdue";
  assignedAt: Date;
}

interface DashboardClientProps {
  stats: DashboardStats | null;
  quizzes?: Quiz[];
  assignedQuizzes?: AssignedQuiz[];
  userRole?: string;
}

const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function DashboardClient({ stats, quizzes = [], assignedQuizzes = [], userRole = "user" }: DashboardClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const kpis = stats
    ? [
        { label: "Aktive Quizzes", value: String(stats.activeQuizzes), href: "/quizzes" },
        { label: "Benutzer", value: String(stats.totalUsers), href: "/users" },
        { label: "Abgeschlossen", value: String(stats.completedAttempts), href: "/stats" },
        { label: "Durchschnitt", value: `${stats.averageScore}%`, href: "/stats" },
      ]
    : [
        { label: "Aktive Quizzes", value: "—", href: "/quizzes" },
        { label: "Benutzer", value: "—", href: "/users" },
        { label: "Abgeschlossen", value: "—", href: "/stats" },
        { label: "Durchschnitt", value: "—", href: "/stats" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Willkommen zurueck! Hier ist deine Uebersicht.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { ...CARD_TRANSITION, delay: i * 0.05 }}
          >
            <Link
              href={kpi.href}
              className="block rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/[0.03] hover:border-border"
            >
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className={cn(
                "mt-1 font-heading text-2xl font-bold",
                kpi.value === "—" && "text-muted-foreground/40",
              )}>
                {kpi.value}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Zugewiesene Quizzes (fuer Mitarbeiter) */}
      {assignedQuizzes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Deine Aufgaben</h2>
            <span className="text-xs text-muted-foreground">
              {assignedQuizzes.filter((q) => q.status !== "completed").length} offen
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedQuizzes
              .filter((q) => q.status !== "completed")
              .map((assignment, i) => (
                <motion.div
                  key={assignment.assignmentId}
                  initial={prefersReducedMotion ? false : { y: 15 }}
                  animate={{ y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { ...CARD_TRANSITION, delay: 0.2 + i * 0.05 }}
                >
                  <div className="flex flex-col rounded-2xl border border-primary/20 bg-primary/[0.02] p-5 transition-all duration-200 hover:shadow-md hover:border-primary/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-semibold leading-tight">{assignment.title}</h3>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        assignment.status === "pending" && "bg-chart-3/10 text-chart-3",
                        assignment.status === "in_progress" && "bg-primary/10 text-primary",
                        assignment.status === "overdue" && "bg-destructive/10 text-destructive",
                      )}>
                        {assignment.status === "pending" ? "Offen" : assignment.status === "in_progress" ? "Gestartet" : "Ueberfaellig"}
                      </span>
                    </div>
                    {assignment.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{assignment.description}</p>
                    )}
                    {assignment.dueDate && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Faellig bis: {new Date(assignment.dueDate).toLocaleDateString("de-DE")}
                      </p>
                    )}
                    <Link
                      href={`/play/${assignment.quizId}`}
                      className={cn(
                        "mt-4 inline-flex items-center justify-center gap-2 rounded-lg",
                        "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                        "transition-colors duration-200 hover:bg-primary/90",
                      )}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Starten
                    </Link>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Verfuegbare Quizzes */}
      {quizzes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Verfuegbare Quizzes</h2>
            <span className="text-xs text-muted-foreground">{quizzes.length} Quiz{quizzes.length !== 1 ? "zes" : ""}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { ...CARD_TRANSITION, delay: 0.2 + i * 0.05 }}
              >
                <div className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/[0.03] hover:border-border">
                  <h3 className="font-heading text-sm font-semibold leading-tight">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{quiz.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {quiz.quizMode === "realtime" ? "Echtzeit" : "Asynchron"}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {quiz.visibility === "global" ? "Oeffentlich" : quiz.visibility === "tenant" ? "Firmenintern" : "Abteilung"}
                    </span>
                  </div>
                  <Link
                    href={`/play/${quiz.id}`}
                    className={cn(
                      "mt-4 inline-flex items-center justify-center gap-2 rounded-lg",
                      "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                      "transition-colors duration-200 hover:bg-primary/90",
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Spielen
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {quizzes.length === 0 && stats && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground/60">Noch keine Quizzes verfuegbar</p>
        </div>
      )}
    </div>
  );
}
