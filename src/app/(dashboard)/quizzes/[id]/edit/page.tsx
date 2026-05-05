import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/actions/quiz";
import { requireRouteAccess, getSessionUserData } from "@/lib/auth/session";
import { EditQuizClient } from "./edit-quiz-client";

/**
 * Quiz-Editor — Metadaten + Fragen-Übersicht.
 * RBAC-Guard via /quizzes Prefix (department_lead+).
 * Tenant-Scope + Edit-Permission werden im Action-Layer erzwungen.
 */
export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRouteAccess("/quizzes");

  const { id } = await params;
  const data = await getQuizWithQuestions(id).catch(() => null);
  if (!data) notFound();

  const { tenantId, departmentId, role } = await getSessionUserData();
  const quiz = data.quiz;

  // Edit-Permission spiegelt updateQuiz-Action
  const isAdmin = role === "admin" || role === "super_admin";
  const isLeadOfQuizDept =
    role === "department_lead" &&
    quiz.departmentId !== null &&
    quiz.departmentId === departmentId;
  const inTenant = quiz.tenantId === tenantId || role === "super_admin";
  const canEdit = inTenant && (isAdmin || isLeadOfQuizDept || quiz.createdBy);

  if (!canEdit) notFound();

  return (
    <EditQuizClient
      quiz={quiz}
      questions={data.questions}
      currentUserRole={role}
    />
  );
}
