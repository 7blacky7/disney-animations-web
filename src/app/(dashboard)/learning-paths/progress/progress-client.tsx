"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Lernpfad-Fortschritt Client — Zeigt Fortschritt visuell.
 *
 * User: Eigener Fortschritt pro Lernpfad mit Level-Details
 * DeptLead: Link zur Team-Uebersicht
 */

interface LevelProgress {
  levelId: string;
  levelNumber: number;
  title: string;
  quizId: string;
  minScore: number;
  bestScore: number;
  passed: boolean;
  unlocked: boolean;
  completedAt: Date | null;
}

interface PathProgress {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  levelCount: number;
  progress: {
    totalLevels: number;
    completedLevels: number;
    levels: LevelProgress[];
  };
}

interface ProgressClientProps {
  paths: PathProgress[];
  userRole: string;
}

const CARD_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

export function ProgressClient({ paths, userRole }: ProgressClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const canViewTeam = userRole === "department_lead" || userRole === "admin" || userRole === "super_admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Mein Fortschritt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {paths.length} Lernpfad{paths.length !== 1 ? "e" : ""} verfuegbar
          </p>
        </div>
        <div className="flex gap-2">
          {canViewTeam && (
            <Link
              href="/learning-paths/team"
              className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Team-Fortschritt
            </Link>
          )}
          <Link
            href="/learning-paths"
            className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Alle Lernpfade
          </Link>
        </div>
      </div>

      {/* Lernpfade mit Fortschritt */}
      {paths.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">Noch keine Lernpfade verfuegbar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paths.map((path, i) => {
            const percent = path.progress.totalLevels > 0
              ? Math.round((path.progress.completedLevels / path.progress.totalLevels) * 100)
              : 0;

            return (
              <motion.div
                key={path.id}
                initial={prefersReducedMotion ? false : { y: 15 }}
                animate={{ y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { ...CARD_TRANSITION, delay: i * 0.05 }}
                className="rounded-2xl border border-border/40 bg-card p-6"
              >
                {/* Path Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{path.title}</h2>
                    {path.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{path.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {path.language && (
                      <Badge variant="outline">{path.language}</Badge>
                    )}
                    <Badge variant={percent === 100 ? "default" : "secondary"}>
                      {percent}%
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 w-full rounded-full bg-muted">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: percent / 100 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full origin-left rounded-full",
                      percent === 100 ? "bg-success" : percent > 0 ? "bg-primary" : "bg-muted",
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {path.progress.completedLevels} von {path.progress.totalLevels} Stufen abgeschlossen
                </p>

                {/* Level Details */}
                <div className="mt-4 space-y-2">
                  {path.progress.levels.map((level) => (
                    <div
                      key={level.levelId}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
                        level.passed && "border-success/30 bg-success/5",
                        !level.passed && level.unlocked && "border-primary/30 bg-primary/5",
                        !level.passed && !level.unlocked && "border-border/20 bg-muted/10 opacity-50",
                      )}
                    >
                      {/* Status Icon */}
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                        level.passed && "bg-success text-white",
                        !level.passed && level.unlocked && "bg-primary text-primary-foreground",
                        !level.passed && !level.unlocked && "bg-muted text-muted-foreground",
                      )}>
                        {level.passed ? "✓" : level.levelNumber}
                      </span>

                      {/* Level Info */}
                      <div className="flex-1">
                        <span className="font-medium">{level.title}</span>
                        {level.bestScore > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Bestes Ergebnis: {level.bestScore}% (Min: {level.minScore}%)
                          </span>
                        )}
                      </div>

                      {/* Play Button */}
                      {level.unlocked && !level.passed && (
                        <Link
                          href={`/play/${level.quizId}`}
                          className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Starten
                        </Link>
                      )}
                      {level.unlocked && level.passed && (
                        <Link
                          href={`/play/${level.quizId}`}
                          className="rounded-lg border border-border/60 px-3 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Wiederholen
                        </Link>
                      )}
                      {!level.unlocked && (
                        <span className="text-[10px] text-muted-foreground">Gesperrt</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
