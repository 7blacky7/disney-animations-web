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

function mapDbQuestion(q: typeof questions.$inferSelect): QuestionData {
  const opts = q.options as Record<string, unknown> | null;
  const correct = q.correctAnswer as Record<string, unknown> | null;

  const base: QuestionData = {
    id: q.id,
    type: q.type,
    text: q.content,
    timeLimit: q.timeLimit ?? 30,
    points: q.points ?? 10,
  };

  switch (q.type) {
    case "multiple_choice":
      return {
        ...base,
        options: (opts?.options as string[]) ?? [],
        correctIndex: (correct?.correctIndex as number) ?? 0,
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
        items: (opts?.items as string[]) ?? [],
        correctOrder: (correct?.correct as number[]) ?? [],
      };
    case "matching":
      return {
        ...base,
        matchLeft: (opts?.left as string[]) ?? [],
        matchRight: (opts?.right as string[]) ?? [],
      };
    case "slider":
      return {
        ...base,
        sliderMin: (opts?.min as number) ?? 0,
        sliderMax: (opts?.max as number) ?? 100,
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
        keywords: (correct?.keywords as string[]) ?? (opts?.keywords as string[]) ?? [],
      };
    case "image_choice":
      return {
        ...base,
        options: (opts?.options as string[]) ?? [],
        correctIndex: (correct?.correctIndex as number) ?? 0,
      };
    case "timed":
      return {
        ...base,
        options: (opts?.options as string[]) ?? [],
        correctIndex: (opts?.options as string[])?.indexOf(correct?.correct as string) ?? 0,
        timedLimit: (opts?.timeLimit as number) ?? 10,
      };
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
