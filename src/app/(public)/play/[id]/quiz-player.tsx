"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from "@/components/quiz/QuestionRenderer";
import type { QuestionData } from "@/components/quiz/types";
import { startQuizAttempt, submitAnswer, completeQuizAttempt } from "@/lib/actions/quiz-actions";
import {
  // Countdown
  countdownNumber,
  countdownRing,
  countdownPulse,
  // Score / Points
  scorePop,
  pointsFloat,
  comboMultiplier,
  // Streak
  streakFire,
  streakBadge,
  // Konfetti / Celebration
  confettiParticle,
  celebrationBurst,
  celebrationStar,
  // Question Transitions
  questionEnter,
  answerOptionsContainer,
  answerOptionItem,
  // Results
  resultsReveal,
  resultsPercentage,
  resultsStat,
  // Utilities
  TIMING,
} from "@/animations";

/**
 * Quiz Player — Phase 6 + Gameplay Animation Integration
 *
 * Full Disney-grade quiz experience with:
 * - 3-2-1 countdown before start (countdownNumber/Ring/Pulse)
 * - Staggered answer options (answerOptionsContainer/Item)
 * - Score pops & floating points (+10) on correct answers
 * - Streak fire escalation (1x, 3x, 5x, 10x)
 * - Confetti celebration on quiz completion (>=80%)
 * - Animated results reveal with stats
 *
 * Disney Principles per section documented.
 * All GPU-only (transform/opacity). No Spring + 3-keyframe!
 */

// ---------------------------------------------------------------------------
// Props — Quiz data comes from Server Component (page.tsx)
// ---------------------------------------------------------------------------

interface QuizPlayerProps {
  quizId: string;
  title: string;
  mode: "realtime" | "async";
  questions: QuestionData[];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameState = "intro" | "countdown" | "playing" | "feedback" | "results";

interface Answer {
  questionId: string;
  answer: unknown;
  isCorrect: boolean;
  timeTaken: number;
  points: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POINTS_PER_CORRECT = 100;
const STREAK_BONUS = 50;
const SPEED_BONUS_THRESHOLD = 10; // seconds
const CONFETTI_COUNT = 24;
const COUNTDOWN_SECONDS = [3, 2, 1];
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 45;
const SCORE_CIRCLE_R = 56;
const SCORE_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * SCORE_CIRCLE_R;

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

/** Confetti particle with randomized trajectory via index-based offsets */
function ConfettiPiece({ index }: { index: number }) {
  const xOffset = ((index % 6) - 2.5) * 60;
  const rotation = (index * 47) % 360;
  const hue = (index * 137) % 360;

  return (
    <motion.div
      variants={confettiParticle}
      initial="launch"
      animate="fly"
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: index % 3 === 0 ? "50%" : "2px",
        backgroundColor: `hsl(${hue}, 80%, 60%)`,
        x: xOffset,
        rotate: rotation,
      }}
    />
  );
}

/** Floating "+N" points indicator */
function FloatingPoints({ points, x }: { points: number; x: number }) {
  return (
    <motion.div
      variants={pointsFloat}
      initial="enter"
      animate="float"
      className="pointer-events-none absolute font-heading text-lg font-bold text-success"
      style={{ left: `${x}%`, top: "40%" }}
    >
      +{points}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function QuizPlayer({ quizId, title, mode, questions: quizQuestions }: QuizPlayerProps) {
  const [state, setState] = useState<GameState>("intro");
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showPointsFloat, setShowPointsFloat] = useState<{ points: number; x: number } | null>(null);
  const [showScorePop, setShowScorePop] = useState(false);
  // FIX: useRef for resultId to avoid stale closure in useCallback handlers
  const resultIdRef = useRef<string | null>(null);
  const { prefersReducedMotion } = useAccessibility();

  const question = quizQuestions[currentQ];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentQ + (showFeedback ? 1 : 0)) / totalQuestions) * 100;

  // Streak level for fire animation
  const streakLevel = useMemo(() => {
    if (streak >= 10) return "streak10";
    if (streak >= 5) return "streak5";
    if (streak >= 3) return "streak3";
    if (streak >= 1) return "streak1";
    return "rest";
  }, [streak]);

  // Combo multiplier
  const comboLevel = useMemo(() => {
    if (streak >= 5) return "x5";
    if (streak >= 3) return "x3";
    if (streak >= 2) return "x2";
    return "rest";
  }, [streak]);

  // ---------------------------------------------------------------------------
  // Countdown (3-2-1 before quiz start)
  // ---------------------------------------------------------------------------

  // Start quiz attempt when countdown begins
  useEffect(() => {
    if (state !== "countdown") return;
    if (resultIdRef.current) return; // Already started

    startQuizAttempt(quizId).then((result) => {
      resultIdRef.current = result.id;
    }).catch((err) => {
      console.error("Failed to start quiz attempt:", err);
    });
  }, [state, quizId]);

  useEffect(() => {
    if (state !== "countdown") return;

    if (countdownValue <= 0) {
      setState("playing");
      return;
    }

    const timer = setTimeout(() => {
      setCountdownValue((v) => v - 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [state, countdownValue]);

  // ---------------------------------------------------------------------------
  // Question Timer
  // ---------------------------------------------------------------------------

  const [timedOut, setTimedOut] = useState(false);

  // Countdown timer — decrements every second, flags timeout at 0
  useEffect(() => {
    if (state !== "playing" || showFeedback) return;
    setTimeLeft(question?.timeLimit ?? 30);
    setTimedOut(false);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, state, showFeedback]);

  // Handle timeout in a separate effect (avoids setState-inside-setState)
  useEffect(() => {
    if (timedOut && !showFeedback) {
      handleAnswer(-1);
      setTimedOut(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  // ---------------------------------------------------------------------------
  // Answer Handler
  // ---------------------------------------------------------------------------

  /** Generic answer handler for new question types (drag_drop, matching, etc.) */
  const handleGenericAnswer = useCallback(
    (answer: unknown, isCorrect: boolean) => {
      handleAnswerInternal(answer, isCorrect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQ, showFeedback, timeLeft, totalQuestions, streak],
  );

  const handleAnswer = useCallback(
    (answer: number | boolean) => {
      if (showFeedback) return;

      const q = quizQuestions[currentQ];
      let isCorrect = false;

      if (q.type === "multiple_choice") {
        isCorrect = answer === q.correctIndex;
      } else if (q.type === "true_false") {
        isCorrect = answer === q.correctAnswer;
      }

      handleAnswerInternal(answer, isCorrect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQ, showFeedback, timeLeft, totalQuestions, streak],
  );

  const handleAnswerInternal = useCallback(
    (answer: unknown, isCorrect: boolean) => {
      if (showFeedback) return;

      const q = quizQuestions[currentQ];
      // Calculate points
      let points = 0;
      const timeTaken = (q.timeLimit ?? 30) - timeLeft;

      if (isCorrect) {
        points = POINTS_PER_CORRECT;
        // Speed bonus
        if (timeTaken <= SPEED_BONUS_THRESHOLD) {
          points += Math.round((1 - timeTaken / SPEED_BONUS_THRESHOLD) * POINTS_PER_CORRECT * 0.5);
        }
        // Streak bonus
        const newStreak = streak + 1;
        if (newStreak >= 3) {
          points += STREAK_BONUS * Math.min(newStreak, 10);
        }
        setStreak(newStreak);
        setTotalScore((s) => s + points);

        // Show floating points
        setShowPointsFloat({ points, x: 50 + (Math.random() - 0.5) * 30 });
        setShowScorePop(true);
        setTimeout(() => {
          setShowPointsFloat(null);
          setShowScorePop(false);
        }, 1200);
      } else {
        setStreak(0);
      }

      setSelectedAnswer(answer);
      setShowFeedback(true);
      setAnswers((prev) => [
        ...prev,
        {
          questionId: q.id,
          answer,
          isCorrect,
          timeTaken,
          points,
        },
      ]);

      // Submit answer to server — use ref to avoid stale closure
      const currentResultId = resultIdRef.current;
      if (currentResultId) {
        submitAnswer({
          resultId: currentResultId,
          questionId: q.id,
          answer,
          isCorrect,
          timeTaken,
          pointsEarned: points,
        }).catch((err) => {
          console.error("Failed to submit answer:", err);
        });
      }

      // Auto-advance after feedback
      setTimeout(
        () => {
          if (currentQ + 1 < totalQuestions) {
            setCurrentQ((c) => c + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
          } else {
            // Complete quiz attempt on server — use ref to avoid stale closure
            const finalResultId = resultIdRef.current;
            if (finalResultId) {
              completeQuizAttempt(finalResultId).catch((err) => {
                console.error("Failed to complete quiz attempt:", err);
              });
            }
            setState("results");
          }
        },
        1500,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQ, showFeedback, timeLeft, totalQuestions, streak],
  );

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const showConfetti = state === "results" && scorePercent >= 80;

  // Reset helper
  const resetQuiz = useCallback(() => {
    setState("intro");
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
    setTotalScore(0);
    setCountdownValue(3);
    resultIdRef.current = null;
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* ================================================================= */}
      {/* Header with Streak + Score */}
      {/* ================================================================= */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <span className="font-heading text-sm font-semibold">{title}</span>

        {state === "playing" && (
          <div className="flex items-center gap-4">
            {/* Streak Badge */}
            {streak > 0 && (
              <motion.div
                variants={streakBadge}
                animate="bump"
                key={`streak-${streak}`}
                className="flex items-center gap-1.5"
              >
                <motion.span
                  variants={streakFire}
                  animate={streakLevel}
                  className="text-base"
                  aria-hidden="true"
                >
                  {streak >= 10 ? "\uD83D\uDD25\uD83D\uDD25" : streak >= 5 ? "\uD83D\uDD25" : "\u26A1"}
                </motion.span>
                <span className="font-heading text-xs font-bold text-chart-3">
                  {streak}x Streak
                </span>
              </motion.div>
            )}

            {/* Combo Multiplier */}
            {streak >= 2 && (
              <motion.span
                variants={comboMultiplier}
                animate={comboLevel}
                key={`combo-${comboLevel}`}
                className="rounded-full bg-chart-3/10 px-2 py-0.5 font-heading text-xs font-bold text-chart-3"
              >
                {comboLevel.toUpperCase()} BONUS
              </motion.span>
            )}

            {/* Score */}
            <motion.div
              variants={scorePop}
              animate={showScorePop ? "pop" : "rest"}
              className="font-heading text-sm font-bold"
            >
              {totalScore} Pkt.
            </motion.div>

            {/* Question counter */}
            <span className="text-xs text-muted-foreground">
              Frage {currentQ + 1} / {totalQuestions}
            </span>
          </div>
        )}
      </header>

      {/* ================================================================= */}
      {/* Progress Bar */}
      {/* ================================================================= */}
      {state === "playing" && (
        <div className="h-1 w-full bg-muted">
          <motion.div
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: TIMING.quick, ease: "easeOut" }}
            className="h-full origin-left bg-primary"
          />
        </div>
      )}

      {/* ================================================================= */}
      {/* Content Area */}
      {/* ================================================================= */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        {/* Floating Points Overlay */}
        <AnimatePresence>
          {showPointsFloat && (
            <FloatingPoints
              key={`pts-${answers.length}`}
              points={showPointsFloat.points}
              x={showPointsFloat.x}
            />
          )}
        </AnimatePresence>

        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* =========================================================== */}
            {/* INTRO Screen */}
            {/* =========================================================== */}
            {state === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: TIMING.normal, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 text-center"
              >
                <div className="space-y-3">
                  <h1 className="font-heading text-3xl font-bold">{title}</h1>
                  <p className="text-muted-foreground">{totalQuestions} Fragen</p>
                </div>
                <AnimatedButton
                  shine
                  intensity="bold"
                  size="lg"
                  onClick={() => {
                    setCountdownValue(3);
                    setState("countdown");
                  }}
                >
                  Quiz starten
                </AnimatedButton>
                <a href="/" className="mt-4 block text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  ← Zur Startseite
                </a>
              </motion.div>
            )}

            {/* =========================================================== */}
            {/* COUNTDOWN Screen (3-2-1) */}
            {/* =========================================================== */}
            {state === "countdown" && (
              <motion.div
                key="countdown"
                className="flex flex-col items-center justify-center space-y-8"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Background Pulse */}
                <motion.div
                  variants={countdownPulse}
                  initial="rest"
                  animate={countdownValue <= 1 ? "urgent" : "pulse"}
                  className="absolute inset-0 rounded-3xl bg-primary/5"
                  aria-hidden="true"
                />

                {/* Timer Ring */}
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-primary"
                      variants={countdownRing}
                      initial="full"
                      animate="empty"
                      style={{ strokeDasharray: TIMER_CIRCUMFERENCE }}
                    />
                  </svg>

                  {/* Countdown Number */}
                  <AnimatePresence mode="wait">
                    {COUNTDOWN_SECONDS.includes(countdownValue) && (
                      <motion.span
                        key={`cd-${countdownValue}`}
                        variants={countdownNumber}
                        initial="enter"
                        animate="visible"
                        exit="exit"
                        className="relative font-heading text-6xl font-bold text-primary"
                      >
                        {countdownValue}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <p className="relative text-sm text-muted-foreground">
                  Mach dich bereit...
                </p>
              </motion.div>
            )}

            {/* =========================================================== */}
            {/* PLAYING Screen */}
            {/* =========================================================== */}
            {state === "playing" && question && (
              <motion.div
                key={`q-${currentQ}`}
                variants={questionEnter}
                initial="enter"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {/* Timer Circle with Urgency */}
                <div className="flex justify-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={cn(
                          timeLeft <= 5
                            ? "text-destructive"
                            : timeLeft <= 10
                              ? "text-chart-3"
                              : "text-primary",
                        )}
                        style={{ strokeDasharray: TIMER_CIRCUMFERENCE }}
                        initial={{ strokeDashoffset: TIMER_CIRCUMFERENCE }}
                        animate={{
                          strokeDashoffset:
                            TIMER_CIRCUMFERENCE *
                            (1 - timeLeft / (question.timeLimit ?? 30)),
                        }}
                        transition={{ duration: 0.8, ease: "linear" }}
                      />
                    </svg>
                    <motion.span
                      animate={
                        timeLeft <= 5 && !prefersReducedMotion
                          ? { scale: [1, 1.15, 1] }
                          : {}
                      }
                      transition={
                        timeLeft <= 5
                          ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                          : {}
                      }
                      className={cn(
                        "relative font-heading text-xl font-bold",
                        timeLeft <= 5
                          ? "text-destructive"
                          : timeLeft <= 10
                            ? "text-chart-3"
                            : "text-muted-foreground",
                      )}
                    >
                      {timeLeft}
                    </motion.span>
                  </div>
                </div>

                {/* Question Text */}
                <h2 className="text-center font-heading text-xl font-semibold sm:text-2xl">
                  {question.text}
                </h2>

                {/* MC Options — Staggered Entrance */}
                {question.type === "multiple_choice" && question.options && (
                  <motion.div
                    variants={answerOptionsContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {question.options.map((opt, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = showFeedback && i === question.correctIndex;
                      const isWrong =
                        showFeedback && isSelected && i !== question.correctIndex;

                      return (
                        <motion.button
                          key={i}
                          variants={answerOptionItem}
                          onClick={() => !showFeedback && handleAnswer(i)}
                          animate={
                            isWrong
                              ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
                              : isCorrect
                                ? { scale: [1, 1.03, 1], transition: { duration: 0.3 } }
                                : {}
                          }
                          disabled={showFeedback}
                          className={cn(
                            "rounded-2xl border p-5 text-left text-sm font-medium transition-colors",
                            !showFeedback &&
                              !isSelected &&
                              "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                            isSelected &&
                              !showFeedback &&
                              "border-primary bg-primary/10 text-primary",
                            isCorrect &&
                              "border-success bg-success/10 text-success-foreground dark:text-success",
                            isWrong &&
                              "border-destructive bg-destructive/10 text-destructive",
                          )}
                        >
                          <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* True/False Options — Staggered */}
                {question.type === "true_false" && (
                  <motion.div
                    variants={answerOptionsContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-center gap-4"
                  >
                    {[true, false].map((val) => {
                      const isSelected = selectedAnswer === val;
                      const isCorrect = showFeedback && val === question.correctAnswer;
                      const isWrong =
                        showFeedback && isSelected && val !== question.correctAnswer;

                      return (
                        <motion.button
                          key={String(val)}
                          variants={answerOptionItem}
                          onClick={() => !showFeedback && handleAnswer(val)}
                          animate={
                            isWrong
                              ? { scale: [1, 0.95, 1], transition: { duration: 0.3 } }
                              : isCorrect
                                ? { scale: [1, 1.05, 1], transition: { duration: 0.3 } }
                                : {}
                          }
                          disabled={showFeedback}
                          className={cn(
                            "w-40 rounded-2xl border p-6 text-center font-heading text-lg font-bold transition-colors",
                            !showFeedback &&
                              "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                            isCorrect &&
                              "border-success bg-success/10 text-success-foreground dark:text-success",
                            isWrong &&
                              "border-destructive bg-destructive/10 text-destructive",
                          )}
                        >
                          {val ? "Wahr" : "Falsch"}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Other Question Types — Rendered via QuestionRenderer */}
                {question.type !== "multiple_choice" &&
                  question.type !== "true_false" && (
                    <QuestionRenderer
                      question={question}
                      onAnswer={handleGenericAnswer}
                      showFeedback={showFeedback}
                      disabled={showFeedback}
                    />
                  )}
              </motion.div>
            )}

            {/* =========================================================== */}
            {/* RESULTS Screen */}
            {/* =========================================================== */}
            {state === "results" && (
              <motion.div
                key="results"
                variants={resultsReveal}
                initial="hidden"
                animate="visible"
                className="relative space-y-8 text-center"
              >
                {/* Confetti Overlay (>=80%) */}
                {showConfetti && !prefersReducedMotion && (
                  <motion.div
                    variants={celebrationBurst}
                    initial="rest"
                    animate="burst"
                    className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden"
                    aria-hidden="true"
                  >
                    {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
                      <ConfettiPiece key={i} index={i} />
                    ))}
                  </motion.div>
                )}

                {/* Celebration Stars (>=80%) */}
                {showConfetti && !prefersReducedMotion && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    {[
                      { left: "15%", top: "10%", delay: 0.2 },
                      { left: "80%", top: "15%", delay: 0.5 },
                      { left: "25%", top: "60%", delay: 0.8 },
                      { left: "70%", top: "55%", delay: 1.0 },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        variants={celebrationStar}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: pos.delay }}
                        className="absolute text-2xl"
                        style={{ left: pos.left, top: pos.top }}
                      >
                        {"\u2728"}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Score Circle */}
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r={SCORE_CIRCLE_R}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r={SCORE_CIRCLE_R}
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      stroke="currentColor"
                      className={cn(
                        scorePercent >= 80
                          ? "text-success"
                          : scorePercent >= 60
                            ? "text-chart-3"
                            : "text-destructive",
                      )}
                      strokeDasharray={SCORE_CIRCLE_CIRCUMFERENCE}
                      initial={{ strokeDashoffset: SCORE_CIRCLE_CIRCUMFERENCE }}
                      animate={{
                        strokeDashoffset:
                          SCORE_CIRCLE_CIRCUMFERENCE * (1 - scorePercent / 100),
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </svg>
                  <motion.span
                    variants={resultsPercentage}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "font-heading text-3xl font-bold",
                      scorePercent >= 80
                        ? "text-success"
                        : scorePercent >= 60
                          ? "text-chart-3"
                          : "text-destructive",
                    )}
                  >
                    {scorePercent}%
                  </motion.span>
                </div>

                {/* Result Message */}
                <div>
                  <h2 className="font-heading text-2xl font-bold">
                    {scorePercent >= 80
                      ? "Hervorragend!"
                      : scorePercent >= 60
                        ? "Gut gemacht!"
                        : "Weiter ueben!"}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {correctCount} von {totalQuestions} Fragen richtig beantwortet.
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold text-primary">
                    {totalScore} Punkte
                  </p>
                </div>

                {/* Answer Review — Staggered Stats */}
                <motion.div
                  variants={answerOptionsContainer}
                  initial="hidden"
                  animate="visible"
                  className="mx-auto max-w-md space-y-2 text-left"
                >
                  {answers.map((a, i) => (
                    <motion.div
                      key={a.questionId}
                      variants={resultsStat}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
                        a.isCorrect
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                          a.isCorrect ? "bg-success" : "bg-destructive",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">
                        {quizQuestions[i]?.text}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {a.points > 0 && (
                          <span className="mr-2 text-success">
                            +{a.points}
                          </span>
                        )}
                        {a.timeTaken}s
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={resetQuiz}>
                    Nochmal spielen
                  </Button>
                  <a href="/dashboard">
                    <AnimatedButton shine>Zurueck zum Dashboard</AnimatedButton>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
