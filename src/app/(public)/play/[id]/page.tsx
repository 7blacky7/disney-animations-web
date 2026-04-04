import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { QuizPlayer } from "./quiz-player";
import type { QuestionData } from "@/components/quiz/types";

/**
 * Quiz Play Page — Server Component
 *
 * Loads quiz + questions from DB and passes to client-side QuizPlayer.
 * Public route — no auth required to play a quiz.
 */

/**
 * Parses a DB field that may be:
 * - already a parsed object/array (Drizzle auto-parsed JSON)
 * - a JSON string (single-encoded)
 * - a doubly-escaped JSON string (seed format: '"[\"a\",\"b\"]"')
 */
function parseJsonField(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  try {
    const first = JSON.parse(value);
    // If the result is still a string, parse again (doubly-encoded)
    if (typeof first === "string") {
      return JSON.parse(first);
    }
    return first;
  } catch {
    return value;
  }
}

function mapDbQuestion(q: typeof questions.$inferSelect): QuestionData {
  const opts = parseJsonField(q.options) as Record<string, unknown> | unknown[] | null;
  // correctRaw: the fully-parsed value — may be a number, string, or object
  const correctRaw = parseJsonField(q.correctAnswer);
  // correct: typed as object for named-key access (manual DB format)
  const correct = correctRaw as Record<string, unknown> | null;

  // Normalise opts: seed data stores options directly as a string[] array,
  // while manually-created data wraps them in { items: [...] } or { options: [...] }.
  // We build a unified optsObj for named-key lookups and optsArray for direct arrays.
  const optsArray = Array.isArray(opts) ? (opts as unknown[]) : null;
  const optsObj = optsArray === null ? (opts as Record<string, unknown> | null) : null;

  const base: QuestionData = {
    id: q.id,
    type: q.type,
    text: q.content,
    timeLimit: q.timeLimit ?? 30,
    points: q.points ?? 10,
  };

  // Helper: resolve options list from either format
  // Seed format:  opts is string[]  (direct array)
  // Manual format: opts is { options: string[] } or { items: string[] } etc.
  const getOptions = (): string[] =>
    optsArray as string[] ??
    (optsObj?.options as string[]) ??
    [];

  // Helper: resolve correct index
  // Seed format:  correctParsed is a number or numeric string ("1")
  // Manual format: correct is { correctIndex: number }
  const getCorrectIndex = (): number => {
    if (correct?.correctIndex !== undefined) return correct.correctIndex as number;
    const raw = correctRaw;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  };

  switch (q.type) {
    case "multiple_choice":
      return {
        ...base,
        options: getOptions(),
        correctIndex: getCorrectIndex(),
      };
    case "true_false":
      return {
        ...base,
        correctAnswer: (correct?.correct as boolean) ?? false,
      };
    case "drag_drop":
    case "sorting":
      return {
        ...base,
        items: (optsArray as string[]) ?? (optsObj?.items as string[]) ?? [],
        correctOrder: (correct?.correct as number[]) ?? [],
      };
    case "matching":
      return {
        ...base,
        matchLeft: (optsObj?.left as string[]) ?? [],
        matchRight: (optsObj?.right as string[]) ?? [],
      };
    case "slider":
      return {
        ...base,
        sliderMin: (optsObj?.min as number) ?? 0,
        sliderMax: (optsObj?.max as number) ?? 100,
        sliderCorrect: (correct?.value as number) ?? 50,
        sliderTolerance: (correct?.tolerance as number) ?? 1,
      };
    case "fill_blank":
      return {
        ...base,
        blankText: q.content,
        blankAnswers: [
          (correct?.answer as string) ?? "",
          ...((correct?.alternatives as string[]) ?? []),
        ],
      };
    case "free_text":
      return {
        ...base,
        keywords:
          (correct?.keywords as string[]) ??
          (optsObj?.keywords as string[]) ??
          [],
      };
    case "image_choice":
      return {
        ...base,
        options: getOptions(),
        correctIndex: getCorrectIndex(),
      };
    case "timed": {
      const timedOptions = getOptions();
      return {
        ...base,
        options: timedOptions,
        correctIndex:
          correct?.correctIndex !== undefined
            ? (correct.correctIndex as number)
            : timedOptions.indexOf(correct?.correct as string) !== -1
              ? timedOptions.indexOf(correct?.correct as string)
              : getCorrectIndex(),
        timedLimit: (optsObj?.timeLimit as number) ?? 10,
      };
    }
    default:
      return base;
  }
}

export default async function QuizPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Quiz nicht gefunden.</p>
      </div>
    );
  }

  const dbQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id))
    .orderBy(questions.order);

  const mappedQuestions = dbQuestions.map(mapDbQuestion);

  return (
    <QuizPlayer
      quizId={quiz.id}
      title={quiz.title}
      mode={quiz.quizMode}
      questions={mappedQuestions}
    />
  );
}
