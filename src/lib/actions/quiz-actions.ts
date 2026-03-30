"use server";

import { db } from "@/lib/db";
import { quizzes, questions, quizResults, quizAnswers } from "@/lib/db/schema";
import { requireSession, requireRole } from "@/lib/auth/session";
import { eq, and, desc, count } from "drizzle-orm";

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

// ---------------------------------------------------------------------------
// Quiz CRUD
// ---------------------------------------------------------------------------

/**
 * Erstellt ein neues Quiz.
 * Berechtigung: admin oder department_lead
 */
export async function createQuiz(input: CreateQuizInput) {
  const session = await requireRole("department_lead");
  const userId = session.user.id;
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

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
  }).returning();

  return quiz;
}

/**
 * Quiz aktualisieren.
 * Berechtigung: Ersteller oder admin
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<CreateQuizInput> & { isPublished?: boolean },
) {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (existing.createdBy !== session.user.id && userRole !== "admin" && userRole !== "super_admin") {
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
 * Berechtigung: Ersteller oder admin
 */
export async function deleteQuiz(quizId: string) {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (existing.createdBy !== session.user.id && userRole !== "admin" && userRole !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return { success: true };
}

/**
 * Quizzes auflisten (mit Sichtbarkeits-Filterung).
 */
export async function listQuizzes() {
  const session = await requireSession();
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  // Alle publizierten Quizzes des Mandanten
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

  return result;
}

/**
 * Einzelnes Quiz mit Fragen laden.
 */
export async function getQuizWithQuestions(quizId: string) {
  await requireSession();

  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) throw new Error("Quiz nicht gefunden");

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
// Quiz Results (Spielen)
// ---------------------------------------------------------------------------

/**
 * Quiz-Teilnahme starten.
 */
export async function startQuizAttempt(quizId: string, isPractice = false) {
  const session = await requireSession();

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
 * Antwort einreichen.
 */
export async function submitAnswer(input: SubmitAnswerInput) {
  await requireSession();

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
 */
export async function completeQuizAttempt(resultId: string) {
  await requireSession();

  // Gesamtpunktzahl berechnen
  const answers = await db
    .select()
    .from(quizAnswers)
    .where(eq(quizAnswers.resultId, resultId));

  const totalScore = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const maxScore = answers.length * 10; // Vereinfacht

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
