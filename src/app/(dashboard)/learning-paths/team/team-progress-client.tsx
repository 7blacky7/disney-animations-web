"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Team-Fortschritt Client — DeptLead/Admin sieht Mitarbeiter-Progress.
 *
 * Tabelle: Mitarbeiter × Lernpfade → Fortschritt in Prozent
 * Farbcodiert: 0% grau, 1-49% rot, 50-99% gelb, 100% gruen
 */

interface PathInfo {
  id: string;
  title: string;
  language: string | null;
  levelCount: number;
}

interface MemberProgress {
  userId: string;
  name: string;
  email: string;
  paths: { pathId: string; totalLevels: number; completedLevels: number; percent: number }[];
  overallPercent: number;
}

interface TeamData {
  members: MemberProgress[];
  paths: PathInfo[];
}

interface TeamProgressClientProps {
  teamData: TeamData;
}

function ProgressCell({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent === 0 && "bg-muted",
            percent > 0 && percent < 50 && "bg-destructive",
            percent >= 50 && percent < 100 && "bg-chart-3",
            percent === 100 && "bg-success",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium",
        percent === 0 && "text-muted-foreground",
        percent > 0 && percent < 50 && "text-destructive",
        percent >= 50 && percent < 100 && "text-chart-3",
        percent === 100 && "text-success",
      )}>
        {percent}%
      </span>
    </div>
  );
}

export function TeamProgressClient({ teamData }: TeamProgressClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [search, setSearch] = useState("");

  const filteredMembers = teamData.members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Team-Fortschritt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {teamData.members.length} Mitarbeiter, {teamData.paths.length} Lernpfade
          </p>
        </div>
        <Link
          href="/learning-paths/progress"
          className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Mein Fortschritt
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Mitarbeiter suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Progress Table */}
      {teamData.members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">Keine Mitarbeiter in der Abteilung.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Mitarbeiter</TableHead>
                {teamData.paths.map((path) => (
                  <TableHead key={path.id} className="text-center min-w-[120px]">
                    <div className="space-y-0.5">
                      <span className="text-xs">{path.title}</span>
                      {path.language && (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 block mx-auto w-fit">
                          {path.language}
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center">Gesamt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div>
                      <span className="font-medium text-sm">{member.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{member.email}</span>
                    </div>
                  </TableCell>
                  {teamData.paths.map((path) => {
                    const progress = member.paths.find((p) => p.pathId === path.id);
                    return (
                      <TableCell key={path.id} className="text-center">
                        <ProgressCell percent={progress?.percent ?? 0} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Badge variant={member.overallPercent === 100 ? "default" : "secondary"}>
                      {member.overallPercent}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
