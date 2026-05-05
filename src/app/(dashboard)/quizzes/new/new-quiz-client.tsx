"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import {
  createQuiz,
  updateQuiz,
  addQuestion as addQuestionAction,
  updateQuestion as updateQuestionAction,
  deleteQuestion as deleteQuestionAction,
} from "@/lib/actions/quiz";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import {
  MCIcon,
  DragDropIcon,
  MatchingIcon,
  SliderIcon,
  FillInIcon,
  FreetextIcon,
  TrueFalseIcon,
  ImageChoiceIcon,
  SortingIcon,
  TimerIcon,
} from "@/components/icons";
import { AnswerEditor, type QuestionData } from "@/components/quiz/AnswerEditor";
import { cn } from "@/lib/utils";

/**
 * Quiz Builder — Wizard-style quiz creation + edit.
 *
 * Modes:
 *  - "create" (default): leerer Stand, startet bei "Grundlagen".
 *  - "edit": vorbefüllt aus initialQuiz/initialQuestions, startet bei "Fragen";
 *    Save ruft updateQuiz + diff der Fragen (add/update/delete).
 */

const STEPS = ["Grundlagen", "Fragen", "Vorschau"] as const;
type Step = (typeof STEPS)[number];

const QUESTION_TYPES = [
  { id: "multiple_choice", label: "Multiple Choice", icon: MCIcon, color: "var(--primary)" },
  { id: "true_false", label: "Wahr / Falsch", icon: TrueFalseIcon, color: "var(--chart-1)" },
  { id: "drag_drop", label: "Drag & Drop", icon: DragDropIcon, color: "var(--chart-3)" },
  { id: "matching", label: "Matching", icon: MatchingIcon, color: "var(--chart-2)" },
  { id: "slider", label: "Slider", icon: SliderIcon, color: "var(--chart-4)" },
  { id: "fill_blank", label: "Lueckentext", icon: FillInIcon, color: "var(--accent)" },
  { id: "free_text", label: "Freitext", icon: FreetextIcon, color: "var(--chart-5)" },
  { id: "image_choice", label: "Bildauswahl", icon: ImageChoiceIcon, color: "var(--primary)" },
  { id: "sorting", label: "Reihenfolge", icon: SortingIcon, color: "var(--chart-2)" },
  { id: "timed", label: "Zeitdruck", icon: TimerIcon, color: "var(--destructive)" },
  { id: "code_input", label: "Code-Eingabe", icon: FreetextIcon, color: "var(--chart-5)" },
  { id: "terminal", label: "Terminal", icon: FreetextIcon, color: "var(--chart-3)" },
] as const;

type FormVisibility = "global" | "company" | "department";
type DbVisibility = "global" | "tenant" | "department";

function dbVisibilityToForm(v: DbVisibility): FormVisibility {
  return v === "tenant" ? "company" : v;
}

interface InitialQuiz {
  id: string;
  title: string;
  description: string | null;
  quizMode: "realtime" | "async";
  visibility: DbVisibility;
  isPracticeAllowed: boolean;
  isPublished: boolean;
}

export interface QuizBuilderProps {
  mode?: "create" | "edit";
  initialQuiz?: InitialQuiz;
  initialQuestions?: QuestionData[];
}

/** Backwards-Compat Export: alte Imports nutzen NewQuizClient weiter. */
export function NewQuizClient(props: QuizBuilderProps = {}) {
  return <QuizBuilderClient {...props} />;
}

export function QuizBuilderClient({
  mode = "create",
  initialQuiz,
  initialQuestions = [],
}: QuizBuilderProps) {
  const { prefersReducedMotion } = useAccessibility();
  const router = useRouter();

  const isEdit = mode === "edit" && !!initialQuiz;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(isEdit ? "Fragen" : "Grundlagen");
  const [title, setTitle] = useState(initialQuiz?.title ?? "");
  const [description, setDescription] = useState(initialQuiz?.description ?? "");
  const [quizModeState, setQuizModeState] = useState<"async" | "realtime">(
    initialQuiz?.quizMode ?? "async",
  );
  const [visibility, setVisibility] = useState<FormVisibility>(
    initialQuiz ? dbVisibilityToForm(initialQuiz.visibility) : "company",
  );
  const [practiceAllowed, setPracticeAllowed] = useState(
    initialQuiz?.isPracticeAllowed ?? true,
  );
  const [isPublished, setIsPublished] = useState(initialQuiz?.isPublished ?? false);
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Snapshot der initial geladenen Frage-IDs — für Diff beim Save (edit-mode).
  const initialIdsRef = useRef<Set<string>>(
    new Set(initialQuestions.map((q) => q.id)),
  );

  const stepIndex = STEPS.indexOf(currentStep);

  function addQuestion(typeId: string) {
    const newQ: QuestionData = {
      id: `q-${Math.random().toString(36).slice(2) + Date.now().toString(36)}`,
      type: typeId,
      title: "",
      ...(typeId === "multiple_choice" || typeId === "image_choice" || typeId === "timed"
        ? { options: ["", "", "", ""], correctIndex: 0 }
        : {}),
      ...(typeId === "true_false" ? { correctAnswer: true } : {}),
      ...(typeId === "sorting" || typeId === "drag_drop" ? { items: ["", "", ""] } : {}),
      ...(typeId === "matching" ? { matchLeft: ["", ""], matchRight: ["", ""] } : {}),
      ...(typeId === "slider" ? { sliderMin: 0, sliderMax: 100, sliderCorrect: 50, sliderTolerance: 5 } : {}),
      ...(typeId === "fill_blank" ? { blankAnswer: "" } : {}),
      ...(typeId === "free_text" ? { keywords: [""] } : {}),
      ...(typeId === "code_input" ? { codeTemplate: "", codeSolution: "", programmingLanguage: "javascript" } : {}),
      ...(typeId === "terminal" ? { expectedCommands: [""], expectedOutput: "", terminalPrompt: "user@linux:~$", terminalHint: "" } : {}),
      ...(typeId === "timed" ? { timeLimit: 30 } : {}),
      points: 10,
    };
    setQuestions((prev) => [...prev, newQ]);
    setShowTypePicker(false);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateLocalQuestion(id: string, updates: Partial<QuestionData>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }

  /** QuestionData → DB-Insert-Shape (options + correctAnswer JSON). */
  function buildQuestionPayload(q: QuestionData, order: number) {
    let options: unknown = null;
    let correctAnswer: unknown = null;

    switch (q.type) {
      case "multiple_choice":
      case "image_choice":
      case "timed":
        options = q.options?.filter(Boolean);
        correctAnswer = q.correctIndex ?? 0;
        break;
      case "true_false":
        correctAnswer = q.correctAnswer ?? true;
        break;
      case "fill_blank":
        correctAnswer = { answer: q.blankAnswer ?? "", alternatives: [] };
        break;
      case "sorting":
      case "drag_drop":
        options = q.items?.filter(Boolean);
        correctAnswer = q.items?.map((_, idx) => idx) ?? [];
        break;
      case "matching":
        options = { left: q.matchLeft?.filter(Boolean), right: q.matchRight?.filter(Boolean) };
        break;
      case "slider":
        options = { min: q.sliderMin ?? 0, max: q.sliderMax ?? 100 };
        correctAnswer = { value: q.sliderCorrect ?? 50, tolerance: q.sliderTolerance ?? 5 };
        break;
      case "free_text":
        correctAnswer = { keywords: q.keywords?.filter(Boolean) };
        break;
      case "terminal":
        correctAnswer = {
          commands: q.expectedCommands?.filter(Boolean) ?? [],
          output: q.expectedOutput ?? "",
        };
        break;
    }

    return {
      type: q.type,
      content: q.title.trim(),
      options,
      correctAnswer,
      order,
      timeLimit: q.timeLimit,
      points: q.points ?? 10,
      codeTemplate: q.codeTemplate,
      codeSolution: q.codeSolution,
      programmingLanguage: q.programmingLanguage,
    };
  }

  const visibilityMap: Record<FormVisibility, DbVisibility> = {
    global: "global",
    company: "tenant",
    department: "department",
  };

  async function handleSubmit() {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      if (isEdit && initialQuiz) {
        // --- EDIT-Pfad ---
        await updateQuiz(initialQuiz.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          quizMode: quizModeState,
          visibility: visibilityMap[visibility],
          isPracticeAllowed: practiceAllowed,
          isPublished,
        });

        const initialIds = initialIdsRef.current;
        const currentIds = new Set(questions.map((q) => q.id));

        // Updates + neue Fragen
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.title.trim()) continue;
          const payload = buildQuestionPayload(q, i + 1);
          if (initialIds.has(q.id)) {
            await updateQuestionAction(q.id, payload);
          } else {
            await addQuestionAction({ quizId: initialQuiz.id, ...payload });
          }
        }

        // Gelöschte Fragen entfernen
        for (const id of initialIds) {
          if (!currentIds.has(id)) {
            await deleteQuestionAction(id);
          }
        }

        router.push("/quizzes");
        router.refresh();
      } else {
        // --- CREATE-Pfad ---
        const quiz = await createQuiz({
          title: title.trim(),
          description: description.trim() || undefined,
          quizMode: quizModeState,
          visibility: visibilityMap[visibility],
          isPracticeAllowed: practiceAllowed,
        });

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.title.trim()) continue;
          const payload = buildQuestionPayload(q, i + 1);
          await addQuestionAction({ quizId: quiz.id, ...payload });
        }

        router.push("/quizzes");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
      setIsSaving(false);
    }
  }

  const headerTitle = isEdit ? "Quiz bearbeiten" : "Neues Quiz erstellen";
  const headerSub = isEdit
    ? "Änderungen werden erst nach „Speichern“ übernommen."
    : "Erstelle ein Quiz in drei einfachen Schritten.";
  const submitLabel = isEdit ? "Speichern" : "Quiz veroeffentlichen";
  const submitProgressLabel = isEdit ? "Wird gespeichert…" : "Wird veroeffentlicht...";

  // Memo: nur Submit erlaubt wenn Titel da und (im edit) etwas änderbar.
  const canSubmit = useMemo(() => Boolean(title.trim()), [title]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{headerTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{headerSub}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(step)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                currentStep === step
                  ? "bg-primary text-primary-foreground"
                  : i < stepIndex
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-8", i < stepIndex ? "bg-primary/30" : "bg-border/40")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === "Grundlagen" && (
          <motion.div
            key="grundlagen"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz-Titel</Label>
                <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. JavaScript Grundlagen" className="text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-desc">Beschreibung</Label>
                <Textarea id="quiz-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Worum geht es in diesem Quiz?" rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quiz-Modus</Label>
                  <Select value={quizModeState} onValueChange={(v) => setQuizModeState((v as "async" | "realtime") ?? "async")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="async">Asynchron (jeder fuer sich)</SelectItem>
                      <SelectItem value="realtime">Echtzeit (Kahoot-Style)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sichtbarkeit</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility((v as FormVisibility) ?? "company")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Oeffentlich</SelectItem>
                      <SelectItem value="company">Firmenintern</SelectItem>
                      <SelectItem value="department">Abteilungsintern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
                <div>
                  <p className="text-sm font-medium">Uebungsmodus erlauben</p>
                  <p className="text-xs text-muted-foreground">Benutzer koennen dieses Quiz zum Ueben spielen.</p>
                </div>
                <Switch checked={practiceAllowed} onCheckedChange={setPracticeAllowed} />
              </div>
              {isEdit && (
                <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
                  <div>
                    <p className="text-sm font-medium">Veröffentlicht</p>
                    <p className="text-xs text-muted-foreground">Nur veröffentlichte Quizzes sind spielbar.</p>
                  </div>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <AnimatedButton shine onClick={() => setCurrentStep("Fragen")}>
                Weiter zu Fragen
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-2 h-4 w-4">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {currentStep === "Fragen" && (
          <motion.div
            key="fragen"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="space-y-3">
              {questions.map((q, i) => {
                const typeInfo = QUESTION_TYPES.find((t) => t.id === q.type);
                const TypeIcon = typeInfo?.icon ?? MCIcon;
                return (
                  <motion.div
                    key={q.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                    className="rounded-2xl border border-border/40 bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ color: typeInfo?.color, backgroundColor: `color-mix(in oklch, ${typeInfo?.color} 10%, transparent)` }}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Frage {i + 1} — {typeInfo?.label}
                          </span>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="text-muted-foreground/50 hover:text-destructive transition-colors"
                            aria-label="Frage entfernen"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <Input
                          value={q.title}
                          onChange={(e) => updateLocalQuestion(q.id, { title: e.target.value })}
                          placeholder="Frage eingeben..."
                          className="text-sm"
                        />
                        <AnswerEditor
                          question={q}
                          onUpdate={(updates) => updateLocalQuestion(q.id, updates)}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={() => setShowTypePicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 p-6 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Frage hinzufuegen
            </button>

            <AnimatePresence>
              {showTypePicker && (
                <>
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : undefined}
                    className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
                    onClick={() => setShowTypePicker(false)}
                  />
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed left-1/2 top-[10%] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-border/50 bg-background p-6 shadow-xl"
                  >
                    <h2 className="font-heading text-lg font-bold">Frage-Typ waehlen</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Waehle einen der Quiz-Typen.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {QUESTION_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => addQuestion(type.id)}
                            className="flex flex-col items-center gap-2 rounded-xl border border-border/40 p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
                          >
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-xl"
                              style={{ color: type.color, backgroundColor: `color-mix(in oklch, ${type.color} 10%, transparent)` }}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-[10px] font-medium text-center leading-tight">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowTypePicker(false)}>Abbrechen</Button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("Grundlagen")}>Zurueck</Button>
              <AnimatedButton shine onClick={() => setCurrentStep("Vorschau")} disabled={questions.length === 0}>
                Vorschau
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-2 h-4 w-4">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {currentStep === "Vorschau" && (
          <motion.div
            key="vorschau"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold">{title || "Ohne Titel"}</h2>
              <p className="text-sm text-muted-foreground">{description || "Keine Beschreibung"}</p>
              <div className="flex gap-2 text-xs flex-wrap">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary font-medium">
                  {quizModeState === "realtime" ? "Echtzeit" : "Asynchron"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground font-medium">
                  {visibility === "global" ? "Oeffentlich" : visibility === "company" ? "Firmenintern" : "Abteilung"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground font-medium">
                  {questions.length} Fragen
                </span>
                {isEdit && (
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 font-medium",
                    isPublished
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground",
                  )}>
                    {isPublished ? "Veröffentlicht" : "Entwurf"}
                  </span>
                )}
              </div>
            </div>

            {questions.map((q, i) => {
              const typeInfo = QUESTION_TYPES.find((t) => t.id === q.type);
              return (
                <div key={q.id} className="rounded-xl border border-border/40 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Frage {i + 1} — {typeInfo?.label}</p>
                  <p className="text-sm font-medium">{q.title || "Noch keine Frage eingegeben"}</p>
                </div>
              );
            })}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("Fragen")}>Zurueck bearbeiten</Button>
              <AnimatedButton shine intensity="bold" onClick={handleSubmit} disabled={isSaving || !canSubmit}>
                {isSaving ? submitProgressLabel : submitLabel}
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
