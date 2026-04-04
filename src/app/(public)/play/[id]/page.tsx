import Link from "next/link";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { users } from "@/lib/db/schema";
import { QuizPlayer } from "./quiz-player";
import type { ClientQuestionData } from "@/components/quiz/types";

/**
 * Quiz Play Page — Server Component
 *
 * Loads quiz + questions from DB and passes to client-side QuizPlayer.
 * Public route — no auth required to play a quiz.
 *
 * SECURITY (F1): Correct answers are NEVER sent to the client.
 *   → mapDbQuestionForClient() strips all correct-answer fields.
 *   → Answer evaluation happens server-side via evaluateAndSubmitAnswer().
 *
 * SECURITY (F9): Only published quizzes can be played.
 *   → isPublished check before rendering.
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

/**
 * SECURITY: Maps DB question to CLIENT-SAFE format.
 * NO correct answers are included — only display data.
 *
 * For matching questions, matchRight is shuffled server-side to prevent
 * the client from inferring correct pairs from index positions.
 */
function mapDbQuestionForClient(q: typeof questions.$inferSelect): ClientQuestionData {
  const opts = parseJsonField(q.options) as Record<string, unknown> | unknown[] | null;
  const optsArray = Array.isArray(opts) ? (opts as unknown[]) : null;
  const optsObj = optsArray === null ? (opts as Record<string, unknown> | null) : null;

  const base: ClientQuestionData = {
    id: q.id,
    type: q.type,
    text: q.content,
    timeLimit: q.timeLimit ?? 30,
    points: q.points ?? 10,
  };

  // Helper: resolve options list from either format
  const getOptions = (): string[] =>
    (optsArray as string[]) ??
    (optsObj?.options as string[]) ??
    [];

  switch (q.type) {
    case "multiple_choice":
      return {
        ...base,
        options: getOptions(),
        // SECURITY: NO correctIndex
      };
    case "true_false":
      return {
        ...base,
        // SECURITY: NO correctAnswer
      };
    case "drag_drop":
    case "sorting":
      return {
        ...base,
        items: (optsArray as string[]) ?? (optsObj?.items as string[]) ?? [],
        // SECURITY: NO correctOrder
      };
    case "matching": {
      const matchLeft = (optsObj?.left as string[]) ?? [];
      const matchRight = (optsObj?.right as string[]) ?? [];

      // SECURITY: Shuffle matchRight server-side.
      // Original order reveals correct pairs (left[i] ↔ right[i]).
      // Deterministic shuffle based on question ID for consistency.
      const shuffleIndices = matchRight.map((_, i) => i);
      for (let i = shuffleIndices.length - 1; i > 0; i--) {
        const j = (q.id.charCodeAt(0) * (i + 1)) % (i + 1);
        [shuffleIndices[i], shuffleIndices[j]] = [shuffleIndices[j], shuffleIndices[i]];
      }
      const shuffledRight = shuffleIndices.map((idx) => matchRight[idx]);

      // shuffleMap: shuffledIdx → originalIdx (for server to reverse when evaluating)
      return {
        ...base,
        matchLeft,
        matchRight: shuffledRight,
        matchShuffleMap: shuffleIndices,
      };
    }
    case "slider":
      return {
        ...base,
        sliderMin: (optsObj?.min as number) ?? 0,
        sliderMax: (optsObj?.max as number) ?? 100,
        // SECURITY: NO sliderCorrect, NO sliderTolerance
      };
    case "fill_blank":
      return {
        ...base,
        blankText: q.content,
        // SECURITY: NO blankAnswers
      };
    case "free_text":
      return {
        ...base,
        // SECURITY: NO keywords
      };
    case "image_choice":
      return {
        ...base,
        options: getOptions(),
        // SECURITY: NO correctIndex
      };
    case "timed": {
      return {
        ...base,
        options: getOptions(),
        timedLimit: (optsObj?.timeLimit as number) ?? 10,
        // SECURITY: NO correctIndex
      };
    }
    case "code_input": {
      // Parse referenceUrls from DB
      const refUrls = parseJsonField(q.referenceUrls);
      return {
        ...base,
        codeTemplate: q.codeTemplate ?? undefined,
        programmingLanguage: q.programmingLanguage ?? undefined,
        referenceUrls: Array.isArray(refUrls) ? refUrls as { url: string; title: string }[] : undefined,
        // SECURITY: NO codeSolution — evaluated server-side
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

  let quiz;
  try {
    const [result] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);
    quiz = result;
  } catch {
    // Ungueltige UUID oder DB-Fehler → 404
    notFound();
  }

  if (!quiz) {
    notFound();
  }

  // SECURITY (F9): Unpublished Quizzes sind NICHT spielbar
  if (!quiz.isPublished) {
    notFound();
  }

  // SECURITY: Tenant-Isolation fuer nicht-globale Quizzes
  // Globale Quizzes: Jeder darf spielen (auch ohne Login)
  // Tenant/Department Quizzes: Nur User des eigenen Tenants/Departments
  if (quiz.visibility !== "global") {
    const session = await getSession();
    if (!session) {
      // Nicht eingeloggt → kein Zugriff auf nicht-globale Quizzes
      notFound();
    }

    // User-Daten laden fuer Tenant/Dept Check
    const [dbUser] = await db
      .select({ tenantId: users.tenantId, departmentId: users.departmentId, role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!dbUser) {
      notFound();
    }

    // Super-Admin darf alles
    if (dbUser.role !== "super_admin") {
      // Tenant-Check: Quiz muss zum eigenen Tenant gehoeren
      if (quiz.tenantId !== dbUser.tenantId) {
        notFound();
      }

      // Department-Check: Bei department-Visibility muss User in gleicher Abteilung sein
      if (quiz.visibility === "department" && quiz.departmentId !== dbUser.departmentId) {
        notFound();
      }
    }
  }

  const dbQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id))
    .orderBy(questions.order);

  // SECURITY (F1): Nur Client-sichere Daten (KEINE korrekten Antworten)
  const mappedQuestions = dbQuestions.map(mapDbQuestionForClient);

  // Quiz mit 0 Fragen: Leerer-Quiz Hinweis statt Player
  if (mappedQuestions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-heading text-2xl font-bold">{quiz.title}</h1>
        <p className="text-muted-foreground">Dieses Quiz hat noch keine Fragen.</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Zurueck zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <QuizPlayer
      quizId={quiz.id}
      title={quiz.title}
      mode={quiz.quizMode}
      questions={mappedQuestions}
    />
  );
}
