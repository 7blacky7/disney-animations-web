"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";

/**
 * Quiz Manager — Lists all quizzes with status, filters, and create button
 * Phase 5: Quiz management overview
 * TODO: Connect to real API
 */

interface Quiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  mode: "realtime" | "async";
  visibility: "global" | "company" | "department";
  status: "draft" | "published" | "archived";
  playCount: number;
  createdAt: string;
}

const MOCK_QUIZZES: Quiz[] = [
  { id: "1", title: "Disney Animations Grundlagen", description: "Die 12 Prinzipien der Animation", questionCount: 12, mode: "async", visibility: "global", status: "published", playCount: 48, createdAt: "28.03.2026" },
  { id: "2", title: "Web-Performance Quiz", description: "Teste dein Wissen ueber Performance-Optimierung", questionCount: 8, mode: "realtime", visibility: "company", status: "published", playCount: 23, createdAt: "29.03.2026" },
  { id: "3", title: "TypeScript Advanced", description: "Generics, Utility Types und mehr", questionCount: 15, mode: "async", visibility: "department", status: "draft", playCount: 0, createdAt: "30.03.2026" },
];

const MODE_LABELS = { realtime: "Echtzeit", async: "Asynchron" };
const VISIBILITY_LABELS = { global: "Oeffentlich", company: "Firmenintern", department: "Abteilung" };
const STATUS_COLORS = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  archived: "bg-muted text-muted-foreground/60",
};

export default function QuizzesPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_QUIZZES.filter(
    (q) => q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{MOCK_QUIZZES.length} Quizzes erstellt.</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((quiz, i) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <Link
              href={`/quizzes/${quiz.id}/edit`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/[0.03] hover:border-border"
            >
              <div className="flex items-start justify-between">
                <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[quiz.status])}>
                  {quiz.status === "draft" ? "Entwurf" : quiz.status === "published" ? "Veroeffentlicht" : "Archiviert"}
                </Badge>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{MODE_LABELS[quiz.mode]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{VISIBILITY_LABELS[quiz.visibility]}</Badge>
                </div>
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold group-hover:text-primary transition-colors">{quiz.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{quiz.questionCount} Fragen</span>
                <span>{quiz.playCount}x gespielt</span>
                <span className="ml-auto">{quiz.createdAt}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
