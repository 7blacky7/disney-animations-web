"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
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
} from "@/components/icons/QuizIcons";
import { cn } from "@/lib/utils";

/**
 * Quiz Builder — Wizard-style quiz creation
 * Phase 5: Metadaten → Fragen hinzufuegen → Vorschau → Publish
 *
 * TODO: Connect to real API (Server Actions)
 * TODO: DnD reorder questions
 * TODO: Live preview panel
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
] as const;

interface Question {
  id: string;
  type: string;
  title: string;
  options?: string[];
  timeLimit?: number;
}

export default function NewQuizPage() {
  const { prefersReducedMotion } = useAccessibility();
  const [currentStep, setCurrentStep] = useState<Step>("Grundlagen");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("async");
  const [visibility, setVisibility] = useState("company");
  const [practiceAllowed, setPracticeAllowed] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);

  function addQuestion(typeId: string) {
    const newQ: Question = {
      id: `q-${crypto.randomUUID()}`,
      type: typeId,
      title: "",
      options: typeId === "multiple_choice" ? ["", "", "", ""] : undefined,
      timeLimit: typeId === "timed" ? 30 : undefined,
    };
    setQuestions((prev) => [...prev, newQ]);
    setShowTypePicker(false);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Neues Quiz erstellen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Erstelle ein Quiz in drei einfachen Schritten.
        </p>
      </div>

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
                <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Disney Animations Grundlagen" className="text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-desc">Beschreibung</Label>
                <Textarea id="quiz-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Worum geht es in diesem Quiz?" rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quiz-Modus</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v ?? "async")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="async">Asynchron (jeder fuer sich)</SelectItem>
                      <SelectItem value="realtime">Echtzeit (Kahoot-Style)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sichtbarkeit</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v ?? "company")}>
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
            {/* Question list */}
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
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <Input
                          value={q.title}
                          onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                          placeholder="Frage eingeben..."
                          className="text-sm"
                        />
                        {q.options && (
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/40 text-[9px] text-muted-foreground">
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(q.options ?? [])];
                                    newOpts[oi] = e.target.value;
                                    updateQuestion(q.id, { options: newOpts });
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                  className="text-xs h-8"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add question button */}
            <button
              onClick={() => setShowTypePicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 p-6 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Frage hinzufuegen
            </button>

            {/* Type Picker Modal */}
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
                    className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl rounded-2xl border border-border/50 bg-background p-6 shadow-xl sm:inset-x-auto"
                  >
                    <h2 className="font-heading text-lg font-bold">Frage-Typ waehlen</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Waehle einen der 10 Quiz-Typen.</p>
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

            {/* Navigation */}
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
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary font-medium">
                  {mode === "realtime" ? "Echtzeit" : "Asynchron"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground font-medium">
                  {visibility === "global" ? "Oeffentlich" : visibility === "company" ? "Firmenintern" : "Abteilung"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground font-medium">
                  {questions.length} Fragen
                </span>
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
              <AnimatedButton shine intensity="bold">
                Quiz veroeffentlichen
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
