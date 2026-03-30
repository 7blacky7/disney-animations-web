"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quiz Player — Phase 6
 *
 * Modes:
 * - Async: Question-by-question, self-paced, immediate feedback
 * - Realtime: Timer per question (Kahoot-style), score reveal
 * - Practice: Same as async but results tagged as practice
 *
 * Disney Principles:
 * - Anticipation: question entrance animation
 * - Follow-through: answer feedback bounce
 * - Staging: focus on current question
 * - Appeal: clean, engaging UI
 *
 * TODO: Connect to real quiz data via API
 * TODO: WebSocket for realtime mode
 * TODO: Confetti on completion
 */

// Mock quiz data
const MOCK_QUIZ = {
  title: "Disney Animations Grundlagen",
  mode: "async" as const,
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      text: "Welches Disney-Prinzip beschreibt die Vorbereitung auf eine Aktion?",
      options: ["Squash & Stretch", "Anticipation", "Follow Through", "Staging"],
      correctIndex: 1,
      timeLimit: 30,
    },
    {
      id: "q2",
      type: "true_false",
      text: "Slow In Slow Out bedeutet, dass Objekte gleichmaessig beschleunigen.",
      correctAnswer: false,
      timeLimit: 20,
    },
    {
      id: "q3",
      type: "multiple_choice",
      text: "Welches Prinzip sorgt dafuer, dass Bewegungen natuerlich wirken?",
      options: ["Arcs", "Solid Drawing", "Timing", "Exaggeration"],
      correctIndex: 0,
      timeLimit: 30,
    },
    {
      id: "q4",
      type: "multiple_choice",
      text: "Was beschreibt das Prinzip 'Follow Through'?",
      options: [
        "Objekte stoppen abrupt",
        "Teile bewegen sich nach dem Stopp weiter",
        "Alles bewegt sich gleichzeitig",
        "Bewegung in geraden Linien",
      ],
      correctIndex: 1,
      timeLimit: 30,
    },
  ],
};

type GameState = "intro" | "playing" | "feedback" | "results";

interface Answer {
  questionId: string;
  answer: number | boolean;
  isCorrect: boolean;
  timeTaken: number;
}

const OVERSHOOT = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

export default function QuizPlayerPage() {
  const [state, setState] = useState<GameState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const { prefersReducedMotion } = useAccessibility();

  const quiz = MOCK_QUIZ;
  const question = quiz.questions[currentQ];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQ + (showFeedback ? 1 : 0)) / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    if (state !== "playing" || showFeedback) return;
    setTimeLeft(question?.timeLimit ?? 30);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAnswer(-1); // Time's up
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, state, showFeedback]);

  const handleAnswer = useCallback((answer: number | boolean) => {
    if (showFeedback) return;

    const q = quiz.questions[currentQ];
    let isCorrect = false;

    if (q.type === "multiple_choice") {
      isCorrect = answer === q.correctIndex;
    } else if (q.type === "true_false") {
      isCorrect = answer === q.correctAnswer;
    }

    setSelectedAnswer(answer);
    setShowFeedback(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        answer,
        isCorrect,
        timeTaken: (q.timeLimit ?? 30) - timeLeft,
      },
    ]);

    // Auto-advance after feedback
    setTimeout(() => {
      if (currentQ + 1 < totalQuestions) {
        setCurrentQ((c) => c + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setState("results");
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, showFeedback, timeLeft, totalQuestions]);

  const score = answers.filter((a) => a.isCorrect).length;
  const scorePercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <span className="font-heading text-sm font-semibold">{quiz.title}</span>
        {state === "playing" && (
          <span className="text-xs text-muted-foreground">
            Frage {currentQ + 1} / {totalQuestions}
          </span>
        )}
      </header>

      {/* Progress bar */}
      {state === "playing" && (
        <div className="h-1 w-full bg-muted">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* INTRO */}
            {state === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={OVERSHOOT}
                className="space-y-8 text-center"
              >
                <div className="space-y-3">
                  <h1 className="font-heading text-3xl font-bold">{quiz.title}</h1>
                  <p className="text-muted-foreground">{totalQuestions} Fragen</p>
                </div>
                <AnimatedButton shine intensity="bold" size="lg" onClick={() => setState("playing")}>
                  Quiz starten
                </AnimatedButton>
              </motion.div>
            )}

            {/* PLAYING */}
            {state === "playing" && question && (
              <motion.div
                key={`q-${currentQ}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={OVERSHOOT}
                className="space-y-8"
              >
                {/* Timer */}
                <div className="flex justify-center">
                  <motion.div
                    animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full border-2 font-heading text-xl font-bold",
                      timeLeft <= 5 ? "border-destructive text-destructive" :
                      timeLeft <= 10 ? "border-chart-3 text-chart-3" :
                      "border-border text-muted-foreground",
                    )}
                  >
                    {timeLeft}
                  </motion.div>
                </div>

                {/* Question */}
                <h2 className="text-center font-heading text-xl font-semibold sm:text-2xl">
                  {question.text}
                </h2>

                {/* MC Options */}
                {question.type === "multiple_choice" && question.options && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((opt, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = showFeedback && i === question.correctIndex;
                      const isWrong = showFeedback && isSelected && i !== question.correctIndex;

                      return (
                        <motion.button
                          key={i}
                          onClick={() => !showFeedback && handleAnswer(i)}
                          animate={{
                            scale: isWrong ? [1, 0.97, 1] : 1,
                            x: isWrong ? [0, -4, 4, 0] : 0,
                          }}
                          transition={isWrong ? { duration: 0.3 } : OVERSHOOT}
                          disabled={showFeedback}
                          className={cn(
                            "rounded-2xl border p-5 text-left text-sm font-medium transition-colors",
                            !showFeedback && !isSelected && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                            isSelected && !showFeedback && "border-primary bg-primary/10 text-primary",
                            isCorrect && "border-green-500 bg-green-500/10 text-green-700",
                            isWrong && "border-destructive bg-destructive/10 text-destructive",
                          )}
                        >
                          <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {question.type === "true_false" && (
                  <div className="flex justify-center gap-4">
                    {[true, false].map((val) => {
                      const isSelected = selectedAnswer === val;
                      const isCorrect = showFeedback && val === question.correctAnswer;
                      const isWrong = showFeedback && isSelected && val !== question.correctAnswer;

                      return (
                        <motion.button
                          key={String(val)}
                          onClick={() => !showFeedback && handleAnswer(val)}
                          animate={{
                            scale: isWrong ? [1, 0.97, 1] : 1,
                          }}
                          transition={OVERSHOOT}
                          disabled={showFeedback}
                          className={cn(
                            "w-40 rounded-2xl border p-6 text-center font-heading text-lg font-bold transition-colors",
                            !showFeedback && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                            isCorrect && "border-green-500 bg-green-500/10 text-green-700",
                            isWrong && "border-destructive bg-destructive/10 text-destructive",
                          )}
                        >
                          {val ? "Wahr" : "Falsch"}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* RESULTS */}
            {state === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={OVERSHOOT}
                className="space-y-8 text-center"
              >
                {/* Score circle */}
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                  <svg className="-rotate-90 absolute inset-0" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                    <motion.circle
                      cx="64" cy="64" r="56" fill="none" strokeWidth="6" strokeLinecap="round"
                      stroke="currentColor"
                      className={cn(scorePercent >= 80 ? "text-green-500" : scorePercent >= 60 ? "text-chart-3" : "text-destructive")}
                      strokeDasharray={2 * Math.PI * 56}
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - scorePercent / 100) }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className={cn(
                      "font-heading text-3xl font-bold",
                      scorePercent >= 80 ? "text-green-600" : scorePercent >= 60 ? "text-chart-3" : "text-destructive",
                    )}
                  >
                    {scorePercent}%
                  </motion.span>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold">
                    {scorePercent >= 80 ? "Hervorragend!" : scorePercent >= 60 ? "Gut gemacht!" : "Weiter ueben!"}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {score} von {totalQuestions} Fragen richtig beantwortet.
                  </p>
                </div>

                {/* Answer review */}
                <div className="mx-auto max-w-md space-y-2 text-left">
                  {answers.map((a, i) => (
                    <div key={a.questionId} className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
                      a.isCorrect ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5",
                    )}>
                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                        a.isCorrect ? "bg-green-500" : "bg-destructive",
                      )}>
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">{quiz.questions[i]?.text}</span>
                      <span className="text-xs text-muted-foreground">{a.timeTaken}s</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => { setState("intro"); setCurrentQ(0); setAnswers([]); setSelectedAnswer(null); setShowFeedback(false); }}>
                    Nochmal spielen
                  </Button>
                  <AnimatedButton shine>
                    Zurueck zum Dashboard
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
