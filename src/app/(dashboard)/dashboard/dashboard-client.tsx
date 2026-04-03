"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

/**
 * Dashboard Client — Animated KPI cards and activity feed
 *
 * Disney Principles:
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

interface DashboardClientProps {
  stats: DashboardStats | null;
}

const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function DashboardClient({ stats }: DashboardClientProps) {
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

      {/* Activity Feed Placeholder */}
      {!stats && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um deine Dashboard-Daten zu sehen.
          </p>
        </div>
      )}

      {stats && (
        <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-sm text-muted-foreground/60">Aktivitaets-Feed folgt</p>
        </div>
      )}
    </div>
  );
}
