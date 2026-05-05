"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { updateQuiz, deleteQuiz, deleteQuestion } from "@/lib/actions/quiz";

type Visibility = "global" | "tenant" | "department";
type QuizMode = "realtime" | "async";

interface Quiz {
  id: string;
  tenantId: string;
  departmentId: string | null;
  createdBy: string;
  title: string;
  description: string | null;
  quizMode: QuizMode;
  visibility: Visibility;
  isPracticeAllowed: boolean;
  isPublished: boolean;
  timeLimit: string | null;
}

interface Question {
  id: string;
  type: string;
  content: string;
  order: number;
  points: number;
}

interface Props {
  quiz: Quiz;
  questions: Question[];
  currentUserRole: string | null;
}

const VISIBILITY_LABELS: Record<Visibility, string> = {
  global: "Öffentlich (Landing Page)",
  tenant: "Mandant (alle Mitarbeiter)",
  department: "Abteilung",
};

const MODE_LABELS: Record<QuizMode, string> = {
  async: "Asynchron (jederzeit)",
  realtime: "Echtzeit (Kahoot-Stil)",
};

export function EditQuizClient({ quiz, questions: initialQuestions, currentUserRole }: Props) {
  const router = useRouter();
  const { prefersReducedMotion } = useAccessibility();
  const isAdmin = currentUserRole === "admin" || currentUserRole === "super_admin";

  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [visibility, setVisibility] = useState<Visibility>(quiz.visibility);
  const [quizMode, setQuizMode] = useState<QuizMode>(quiz.quizMode);
  const [isPracticeAllowed, setIsPracticeAllowed] = useState(quiz.isPracticeAllowed);
  const [isPublished, setIsPublished] = useState(quiz.isPublished);
  const [questions, setQuestions] = useState(initialQuestions);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | null>(null);

  const isDirty =
    title.trim() !== quiz.title ||
    description.trim() !== (quiz.description ?? "") ||
    visibility !== quiz.visibility ||
    quizMode !== quiz.quizMode ||
    isPracticeAllowed !== quiz.isPracticeAllowed ||
    isPublished !== quiz.isPublished;

  function handleSave() {
    if (!isDirty) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        await updateQuiz(quiz.id, {
          title: title.trim(),
          description: description.trim() || null,
          visibility,
          quizMode,
          isPracticeAllowed,
          isPublished,
        } as Parameters<typeof updateQuiz>[1]);
        setFeedback({ kind: "success", msg: "Quiz aktualisiert." });
        router.refresh();
      } catch (err) {
        setFeedback({ kind: "error", msg: err instanceof Error ? err.message : "Speichern fehlgeschlagen" });
      }
    });
  }

  function handleDeleteQuiz() {
    setFeedback(null);
    startTransition(async () => {
      try {
        await deleteQuiz(quiz.id);
        router.push("/quizzes");
      } catch (err) {
        setFeedback({ kind: "error", msg: err instanceof Error ? err.message : "Löschen fehlgeschlagen" });
        setConfirmDeleteQuiz(false);
      }
    });
  }

  function handleDeleteQuestion(questionId: string) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await deleteQuestion(questionId);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setConfirmDeleteQuestionId(null);
      } catch (err) {
        setFeedback({ kind: "error", msg: err instanceof Error ? err.message : "Frage löschen fehlgeschlagen" });
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/quizzes" className="text-xs text-muted-foreground hover:text-foreground">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight">Quiz bearbeiten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Metadaten und Fragen verwalten. Änderungen werden erst nach &ldquo;Speichern&rdquo; übernommen.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteQuiz(true)}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            Quiz löschen
          </Button>
          <AnimatedButton
            shine
            size="sm"
            onClick={handleSave}
            disabled={isPending || !isDirty || !title.trim()}
          >
            {isPending ? "Speichert…" : "Speichern"}
          </AnimatedButton>
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={
            "rounded-md border px-3 py-2 text-sm " +
            (feedback.kind === "success"
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive")
          }
        >
          {feedback.msg}
        </div>
      )}

      {/* Metadaten */}
      <section className="rounded-2xl border border-border/40 bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold">Metadaten</h2>

        <div className="space-y-2">
          <Label htmlFor="quiz-title">Quiz-Titel</Label>
          <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. JavaScript Grundlagen" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quiz-desc">Beschreibung</Label>
          <Textarea id="quiz-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Worum geht es?" rows={3} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sichtbarkeit</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(VISIBILITY_LABELS) as Visibility[])
                  .filter((v) => v !== "global" || isAdmin)
                  .map((v) => (
                    <SelectItem key={v} value={v}>{VISIBILITY_LABELS[v]}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {!isAdmin && visibility === "global" && (
              <p className="text-xs text-muted-foreground">Nur Admins können „global“ freigeben.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Modus</Label>
            <Select value={quizMode} onValueChange={(v) => setQuizMode(v as QuizMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(MODE_LABELS) as QuizMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{MODE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Übung erlauben</p>
            <p className="text-xs text-muted-foreground">User können das Quiz üben, ohne dass das Ergebnis zählt.</p>
          </div>
          <Switch checked={isPracticeAllowed} onCheckedChange={setIsPracticeAllowed} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Veröffentlicht</p>
            <p className="text-xs text-muted-foreground">Nur veröffentlichte Quizzes sind spielbar.</p>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>
      </section>

      {/* Fragen */}
      <section className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Fragen ({questions.length})</h2>
            <p className="text-sm text-muted-foreground">
              Frage-Editor öffnet sich in einer separaten Ansicht.
            </p>
          </div>
          <Link href={`/quizzes/new?continueId=${quiz.id}`}>
            <Button variant="outline" size="sm">+ Neue Frage</Button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">Noch keine Fragen vorhanden.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {questions.map((q, i) => (
              <li key={q.id} className="flex items-center gap-3 py-3">
                <span className="font-mono text-xs text-muted-foreground w-6 text-right">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{q.content}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{q.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{q.points} Pkt</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteQuestionId(q.id)}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Confirms */}
      <AnimatePresence>
        {confirmDeleteQuiz && (
          <ConfirmDialog
            title="Quiz löschen?"
            body={`„${quiz.title}“ und alle zugehörigen Fragen + Ergebnisse werden unwiderruflich entfernt.`}
            onCancel={() => setConfirmDeleteQuiz(false)}
            onConfirm={handleDeleteQuiz}
            confirmLabel="Endgültig löschen"
            isPending={isPending}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
        {confirmDeleteQuestionId && (
          <ConfirmDialog
            title="Frage löschen?"
            body="Die Frage wird unwiderruflich entfernt."
            onCancel={() => setConfirmDeleteQuestionId(null)}
            onConfirm={() => handleDeleteQuestion(confirmDeleteQuestionId)}
            confirmLabel="Löschen"
            isPending={isPending}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel,
  isPending,
  prefersReducedMotion,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  isPending: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-[20%] z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/50 bg-background p-6 shadow-xl"
      >
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>Abbrechen</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? "…" : confirmLabel}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
