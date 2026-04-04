"use server";

import { db } from "@/lib/db";
import { quizzes, questions, quizResults, quizAnswers, users } from "@/lib/db/schema";
import { requireSession, requireRole, getSessionTenantId, getSessionUserData } from "@/lib/auth/session";
import { eq, and, desc, count, sql } from "drizzle-orm";

/**
 * Quiz Server Actions — CRUD + Sichtbarkeits-Logik
 *
 * Rollen-Berechtigungen:
 * - Quiz erstellen: admin, department_lead
 * - Quiz bearbeiten: Ersteller oder admin
 * - Quiz spielen: Basiert auf visibility (global/tenant/department)
 * - Ergebnisse sehen: Eigene immer, alle ab department_lead
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateQuizInput {
  title: string;
  description?: string;
  quizMode: "realtime" | "async";
  visibility: "global" | "tenant" | "department";
  isPracticeAllowed?: boolean;
  departmentId?: string;
}

interface CreateQuestionInput {
  quizId: string;
  type: string;
  content: string;
  options?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
  order: number;
  timeLimit?: number;
  points?: number;
}

interface SubmitAnswerInput {
  resultId: string;
  questionId: string;
  answer: unknown;
  isCorrect: boolean;
  timeTaken?: number;
  pointsEarned?: number;
}

interface EvaluateAnswerInput {
  resultId: string;
  questionId: string;
  answer: unknown;
  timeTaken?: number;
}

interface AnswerEvaluationResult {
  isCorrect: boolean;
  points: number;
  correctIndex?: number;
  correctAnswer?: boolean;
  correctOrder?: number[];
  sliderCorrect?: number;
  sliderTolerance?: number;
  blankAnswers?: string[];
  keywords?: string[];
}

// ---------------------------------------------------------------------------
// Quiz CRUD
// ---------------------------------------------------------------------------

/**
 * Oeffentliche Quizzes auflisten — KEINE Auth erforderlich.
 * Zeigt nur globale, publizierte Quizzes.
 */
export async function listPublicQuizzes() {
  const result = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      quizMode: quizzes.quizMode,
    })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.visibility, "global"),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt))
    .limit(6);

  return result;
}

/**
 * Erstellt ein neues Quiz.
 * Berechtigung: admin oder department_lead
 */
export async function createQuiz(input: CreateQuizInput) {
  const session = await requireRole("department_lead");
  const userId = session.user.id;
  const tenantId = await getSessionTenantId();

  if (!tenantId) {
    throw new Error("Kein Mandant zugeordnet");
  }

  const [quiz] = await db.insert(quizzes).values({
    tenantId,
    createdBy: userId,
    title: input.title,
    description: input.description,
    quizMode: input.quizMode,
    visibility: input.visibility,
    isPracticeAllowed: input.isPracticeAllowed ?? true,
    departmentId: input.departmentId,
    isPublished: true,
  }).returning();

  return quiz;
}

/**
 * Quiz aktualisieren.
 * Berechtigung: Ersteller oder admin (gleicher Tenant)
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<CreateQuizInput> & { isPublished?: boolean },
) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  // Tenant-Check: Quiz muss zum eigenen Mandanten gehoeren
  if (existing.tenantId !== tenantId) {
    throw new Error("Kein Zugriff auf dieses Quiz");
  }

  // Berechtigungs-Check: Ersteller oder admin/super_admin (Role aus DB, nicht Session!)
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  const [updated] = await db
    .update(quizzes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(quizzes.id, quizId))
    .returning();

  return updated;
}

/**
 * Quiz loeschen.
 * Berechtigung: Ersteller oder admin (gleicher Tenant)
 */
export async function deleteQuiz(quizId: string) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  // Tenant-Check: Quiz muss zum eigenen Mandanten gehoeren
  if (existing.tenantId !== tenantId) {
    throw new Error("Kein Zugriff auf dieses Quiz");
  }

  // Berechtigungs-Check: Ersteller oder admin/super_admin (Role aus DB, nicht Session!)
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return { success: true };
}

/**
 * Quizzes auflisten (mit Sichtbarkeits-Filterung).
 *
 * Visibility-Logik:
 * - global/tenant: Sichtbar fuer alle im gleichen Mandanten
 * - department: Nur sichtbar fuer User in der gleichen Abteilung
 * - admin/super_admin: Sehen alle Mandanten-Quizzes
 */
export async function listQuizzes() {
  const { tenantId, departmentId, role } = await getSessionUserData();

  // Alle publizierten Quizzes des Mandanten laden
  const result = await db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.tenantId, tenantId),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt));

  // Admin/Super-Admin sehen alle Mandanten-Quizzes
  if (role === "admin" || role === "super_admin") {
    return result;
  }

  // Visibility-Filter: department-Quizzes nur fuer eigene Abteilung
  return result.filter((quiz) => {
    if (quiz.visibility === "global" || quiz.visibility === "tenant") return true;
    if (quiz.visibility === "department") {
      return departmentId != null && quiz.departmentId === departmentId;
    }
    return true;
  });
}

/**
 * Einzelnes Quiz mit Fragen laden.
 */
export async function getQuizWithQuestions(quizId: string) {
  const { tenantId, departmentId, role } = await getSessionUserData();

  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) throw new Error("Quiz nicht gefunden");

  // Visibility-Check (admin/super_admin sehen alles)
  if (role !== "admin" && role !== "super_admin") {
    if (quiz.tenantId !== tenantId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
    if (quiz.visibility === "department" && quiz.departmentId !== departmentId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
  }

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(questions.order);

  return { quiz, questions: quizQuestions };
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/**
 * Frage zu einem Quiz hinzufuegen.
 */
export async function addQuestion(input: CreateQuestionInput) {
  await requireRole("department_lead");

  const [question] = await db.insert(questions).values({
    quizId: input.quizId,
    type: input.type as "multiple_choice",
    content: input.content,
    options: input.options ? JSON.stringify(input.options) : null,
    correctAnswer: input.correctAnswer ? JSON.stringify(input.correctAnswer) : null,
    explanation: input.explanation,
    order: input.order,
    timeLimit: input.timeLimit,
    points: input.points ?? 10,
  }).returning();

  return question;
}

/**
 * Frage aktualisieren.
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<CreateQuestionInput>,
) {
  await requireRole("department_lead");

  const [updated] = await db
    .update(questions)
    .set(data as Record<string, unknown>)
    .where(eq(questions.id, questionId))
    .returning();

  return updated;
}

/**
 * Frage loeschen.
 */
export async function deleteQuestion(questionId: string) {
  await requireRole("department_lead");
  await db.delete(questions).where(eq(questions.id, questionId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// JSON Parsing Helper (shared with page.tsx evaluation logic)
// ---------------------------------------------------------------------------

/**
 * Parses a DB JSONB field that may be:
 * - already a parsed object/array (Drizzle auto-parsed JSON)
 * - a JSON string (single-encoded)
 * - a doubly-escaped JSON string (seed format: '"[\"a\",\"b\"]"')
 */
function parseJsonField(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  try {
    const first = JSON.parse(value);
    if (typeof first === "string") {
      return JSON.parse(first);
    }
    return first;
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Quiz Results (Spielen)
// ---------------------------------------------------------------------------

/**
 * Quiz-Teilnahme starten.
 * Prueft ob User Zugriff auf das Quiz hat (Tenant + Visibility).
 */
export async function startQuizAttempt(quizId: string, isPractice = false) {
  const session = await requireSession();
  const { tenantId, departmentId, role } = await getSessionUserData();

  // Quiz laden und Zugriff pruefen
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) throw new Error("Quiz nicht gefunden");

  // Tenant-Check (admin/super_admin duerfen alles)
  if (role !== "admin" && role !== "super_admin") {
    if (quiz.tenantId !== tenantId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
    if (quiz.visibility === "department" && quiz.departmentId !== departmentId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
  }

  const [result] = await db.insert(quizResults).values({
    quizId,
    userId: session.user.id,
    isPractice,
    score: 0,
    maxScore: 0,
  }).returning();

  return result;
}

/**
 * SECURITY: Server-seitige Antwort-Auswertung.
 *
 * Evaluiert die Antwort server-seitig anhand der DB-Daten.
 * Client sendet NUR seine Antwort — KEIN isCorrect.
 * Server laedt die Frage, bewertet, speichert und gibt Feedback zurueck.
 *
 * @returns AnswerEvaluationResult mit isCorrect + Feedback-Daten fuer UI
 */
export async function evaluateAndSubmitAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluationResult> {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, input.resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  // Frage aus DB laden
  const [q] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .limit(1);

  if (!q) throw new Error("Frage nicht gefunden");

  // Correct Answer aus DB parsen
  const correctRaw = parseJsonField(q.correctAnswer);
  const correct = correctRaw as Record<string, unknown> | null;
  const opts = parseJsonField(q.options) as Record<string, unknown> | unknown[] | null;
  const optsArray = Array.isArray(opts) ? opts : null;
  const optsObj = optsArray === null ? (opts as Record<string, unknown> | null) : null;

  // Helper: correctIndex aus verschiedenen DB-Formaten extrahieren
  const resolveCorrectIndex = (): number => {
    if (correct?.correctIndex !== undefined) return correct.correctIndex as number;
    if (typeof correctRaw === "number") return correctRaw;
    if (typeof correctRaw === "string") {
      const n = parseInt(correctRaw, 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  };

  let isCorrect = false;
  const feedback: Partial<AnswerEvaluationResult> = {};

  switch (q.type) {
    case "multiple_choice":
    case "image_choice": {
      const correctIdx = resolveCorrectIndex();
      isCorrect = input.answer === correctIdx;
      feedback.correctIndex = correctIdx;
      break;
    }
    case "true_false": {
      const tfAnswer = typeof correctRaw === "boolean"
        ? correctRaw
        : (correct?.correct as boolean) ?? false;
      isCorrect = input.answer === tfAnswer;
      feedback.correctAnswer = tfAnswer;
      break;
    }
    case "timed": {
      const timedOptions = (optsArray as string[]) ?? (optsObj?.options as string[]) ?? [];
      const correctIdx =
        correct?.correctIndex !== undefined
          ? (correct.correctIndex as number)
          : timedOptions.indexOf(correct?.correct as string) !== -1
            ? timedOptions.indexOf(correct?.correct as string)
            : resolveCorrectIndex();
      isCorrect = input.answer === correctIdx;
      feedback.correctIndex = correctIdx;
      break;
    }
    case "drag_drop":
    case "sorting": {
      const sortOrder = Array.isArray(correctRaw)
        ? (correctRaw as number[])
        : (correct?.correct as number[]) ?? [];
      const userOrder = input.answer as number[];
      isCorrect = Array.isArray(userOrder)
        && userOrder.length === sortOrder.length
        && userOrder.every((v, i) => v === sortOrder[i]);
      feedback.correctOrder = sortOrder;
      break;
    }
    case "matching": {
      // Client sendet Pairs als { leftIdx: rightOriginalIdx }
      // Korrekt wenn leftIdx === rightOriginalIdx (gleicher Index = korrektes Paar)
      const userPairs = input.answer as Record<string, number>;
      if (userPairs && typeof userPairs === "object") {
        isCorrect = Object.entries(userPairs).every(
          ([l, r]) => Number(l) === r,
        );
      }
      break;
    }
    case "slider": {
      const sliderCorrect = (correct?.value as number) ?? 50;
      const tolerance = (correct?.tolerance as number) ?? 1;
      const userValue = input.answer as number;
      isCorrect = typeof userValue === "number"
        && Math.abs(userValue - sliderCorrect) <= tolerance;
      feedback.sliderCorrect = sliderCorrect;
      feedback.sliderTolerance = tolerance;
      break;
    }
    case "fill_blank": {
      const blankAnswer = typeof correctRaw === "string"
        ? correctRaw
        : (correct?.answer as string) ?? "";
      const blankAlts = typeof correctRaw === "string"
        ? []
        : ((correct?.alternatives as string[]) ?? []);
      const allAnswers = [blankAnswer, ...blankAlts].filter(Boolean);
      const userText = typeof input.answer === "string"
        ? input.answer.trim().toLowerCase()
        : "";
      isCorrect = allAnswers.some(
        (a) => a.toLowerCase().trim() === userText,
      );
      feedback.blankAnswers = allAnswers;
      break;
    }
    case "free_text": {
      const kw = (correct?.keywords as string[])
        ?? (optsObj?.keywords as string[])
        ?? [];
      const userText = typeof input.answer === "string"
        ? input.answer.trim().toLowerCase()
        : "";
      isCorrect = kw.length === 0
        ? userText.length > 0
        : kw.some((k) => userText.includes(k.toLowerCase()));
      feedback.keywords = kw;
      break;
    }
  }

  // Punkte berechnen (Base + Speed Bonus)
  const POINTS_PER_CORRECT = 100;
  const SPEED_BONUS_THRESHOLD = 10;
  let points = 0;

  if (isCorrect) {
    points = POINTS_PER_CORRECT;
    const timeTaken = input.timeTaken ?? (q.timeLimit ?? 30);
    if (timeTaken <= SPEED_BONUS_THRESHOLD) {
      points += Math.round(
        (1 - timeTaken / SPEED_BONUS_THRESHOLD) * POINTS_PER_CORRECT * 0.5,
      );
    }

    // Streak-Bonus: Server berechnet aus bisherigen Antworten
    const prevAnswers = await db
      .select({ isCorrect: quizAnswers.isCorrect })
      .from(quizAnswers)
      .where(eq(quizAnswers.resultId, input.resultId))
      .orderBy(quizAnswers.createdAt);

    let streak = 0;
    for (let i = prevAnswers.length - 1; i >= 0; i--) {
      if (prevAnswers[i].isCorrect) streak++;
      else break;
    }
    streak++; // Aktuelle korrekte Antwort dazuzaehlen

    const STREAK_BONUS = 50;
    if (streak >= 3) {
      points += STREAK_BONUS * Math.min(streak, 10);
    }
  }

  // Antwort in DB speichern
  await db.insert(quizAnswers).values({
    resultId: input.resultId,
    questionId: input.questionId,
    answer: input.answer != null ? JSON.stringify(input.answer) : null,
    isCorrect,
    timeTaken: input.timeTaken,
    pointsEarned: points,
  });

  // Score im Result aktualisieren
  if (isCorrect) {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, input.resultId))
      .limit(1);

    if (result) {
      await db
        .update(quizResults)
        .set({ score: result.score + points })
        .where(eq(quizResults.id, input.resultId));
    }
  }

  return {
    isCorrect,
    points,
    ...feedback,
  };
}

/**
 * @deprecated Unsicher — Client sendet isCorrect. Verwende evaluateAndSubmitAnswer().
 * Wird nur noch fuer Migration/Kompatibilitaet behalten.
 *
 * Antwort einreichen.
 * Prueft ob das Result dem eingeloggten User gehoert.
 */
export async function submitAnswer(input: SubmitAnswerInput) {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, input.resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  const [answer] = await db.insert(quizAnswers).values({
    resultId: input.resultId,
    questionId: input.questionId,
    answer: input.answer ? JSON.stringify(input.answer) : null,
    isCorrect: input.isCorrect,
    timeTaken: input.timeTaken,
    pointsEarned: input.pointsEarned ?? 0,
  }).returning();

  // Score aktualisieren
  if (input.isCorrect) {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, input.resultId))
      .limit(1);

    if (result) {
      await db
        .update(quizResults)
        .set({
          score: result.score + (input.pointsEarned ?? 0),
        })
        .where(eq(quizResults.id, input.resultId));
    }
  }

  return answer;
}

/**
 * Quiz-Teilnahme abschliessen.
 * Prueft ob das Result dem eingeloggten User gehoert.
 */
export async function completeQuizAttempt(resultId: string) {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  // Gesamtpunktzahl berechnen
  const answers = await db
    .select()
    .from(quizAnswers)
    .where(eq(quizAnswers.resultId, resultId));

  const totalScore = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const maxScore = answers.length * 100; // POINTS_PER_CORRECT = 100 im Quiz-Player

  const [updated] = await db
    .update(quizResults)
    .set({
      score: totalScore,
      maxScore,
      completedAt: new Date(),
    })
    .where(eq(quizResults.id, resultId))
    .returning();

  return updated;
}

/**
 * Eigene Ergebnisse abrufen.
 */
export async function getMyResults() {
  const session = await requireSession();

  const results = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, session.user.id))
    .orderBy(desc(quizResults.completedAt));

  return results;
}

/**
 * Ergebnisse eines Quiz abrufen (fuer Admins/Leiter).
 */
export async function getQuizResults(quizId: string) {
  await requireRole("department_lead");

  const results = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.quizId, quizId))
    .orderBy(desc(quizResults.score));

  return results;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

/**
 * Aggregierte Dashboard-Statistiken.
 * Gibt KPIs fuer die Uebersichtsseite zurueck.
 */
export async function getDashboardStats() {
  const tenantId = await getSessionTenantId();

  const [quizCount] = await db
    .select({ value: count() })
    .from(quizzes)
    .where(and(eq(quizzes.tenantId, tenantId), eq(quizzes.isPublished, true)));

  const [userCount] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.tenantId, tenantId));

  // Tenant-scoped: Nur Ergebnisse fuer Quizzes des eigenen Mandanten
  const [completedCount] = await db
    .select({ value: count() })
    .from(quizResults)
    .innerJoin(quizzes, eq(quizResults.quizId, quizzes.id))
    .where(and(
      sql`${quizResults.completedAt} IS NOT NULL`,
      eq(quizzes.tenantId, tenantId),
    ));

  const [avgResult] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.maxScore} > 0 THEN LEAST((${quizResults.score}::float / ${quizResults.maxScore}) * 100, 100) ELSE NULL END), 0)`,
    })
    .from(quizResults)
    .innerJoin(quizzes, eq(quizResults.quizId, quizzes.id))
    .where(and(
      sql`${quizResults.completedAt} IS NOT NULL`,
      eq(quizzes.tenantId, tenantId),
    ));

  return {
    activeQuizzes: quizCount?.value ?? 0,
    totalUsers: userCount?.value ?? 0,
    completedAttempts: completedCount?.value ?? 0,
    averageScore: Math.round(avgResult?.avg ?? 0),
  };
}

/**
 * Quiz-Statistiken mit Aggregation pro Quiz.
 */
export async function getQuizStats() {
  const tenantId = await getSessionTenantId();

  const stats = await db
    .select({
      quizId: quizzes.id,
      title: quizzes.title,
      plays: count(quizResults.id),
      avgScore: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.maxScore} > 0 THEN LEAST((${quizResults.score}::float / ${quizResults.maxScore}) * 100, 100) ELSE NULL END), 0)`,
      completionRate: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.completedAt} IS NOT NULL THEN 100 ELSE 0 END), 0)`,
      practiceRatio: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.isPractice} THEN 100 ELSE 0 END), 0)`,
    })
    .from(quizzes)
    .leftJoin(quizResults, eq(quizResults.quizId, quizzes.id))
    .where(and(eq(quizzes.tenantId, tenantId), eq(quizzes.isPublished, true)))
    .groupBy(quizzes.id, quizzes.title)
    .orderBy(desc(count(quizResults.id)));

  return stats.map((s) => ({
    ...s,
    avgScore: Math.round(s.avgScore),
    completionRate: Math.round(s.completionRate),
    practiceRatio: Math.round(s.practiceRatio),
  }));
}
