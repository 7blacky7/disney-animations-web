import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/actions/quiz";
import { requireRouteAccess, getSessionUserData } from "@/lib/auth/session";
import { QuizBuilderClient } from "@/app/(dashboard)/quizzes/new/new-quiz-client";
import type { QuestionData } from "@/components/quiz/AnswerEditor";

/**
 * Quiz-Editor — nutzt den gleichen Quiz-Builder wie Create.
 * Vorbefüllt aus DB, startet auf "Fragen".
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

  const isAdmin = role === "admin" || role === "super_admin";
  const isLeadOfQuizDept =
    role === "department_lead" &&
    quiz.departmentId !== null &&
    quiz.departmentId === departmentId;
  const inTenant = quiz.tenantId === tenantId || role === "super_admin";
  const canEdit = inTenant && (isAdmin || isLeadOfQuizDept || Boolean(quiz.createdBy));

  if (!canEdit) notFound();

  const initialQuestions: QuestionData[] = data.questions.map((q) => mapDbQuestionToForm(q));

  return (
    <QuizBuilderClient
      mode="edit"
      initialQuiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        quizMode: quiz.quizMode,
        visibility: quiz.visibility,
        isPracticeAllowed: quiz.isPracticeAllowed,
        isPublished: quiz.isPublished,
      }}
      initialQuestions={initialQuestions}
    />
  );
}

/** Drizzle-Question-Row → QuestionData (form-shape). */
function mapDbQuestionToForm(q: {
  id: string;
  type: string;
  content: string;
  options: unknown;
  correctAnswer: unknown;
  order: number;
  timeLimit: number | null;
  points: number;
  codeTemplate: string | null;
  codeSolution: string | null;
  programmingLanguage: string | null;
}): QuestionData {
  const base: QuestionData = {
    id: q.id,
    type: q.type,
    title: q.content,
    points: q.points,
    timeLimit: q.timeLimit ?? undefined,
  };

  switch (q.type) {
    case "multiple_choice":
    case "image_choice":
    case "timed":
      base.options = Array.isArray(q.options) ? (q.options as string[]) : ["", "", "", ""];
      base.correctIndex = typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
      break;
    case "true_false":
      base.correctAnswer = q.correctAnswer === true;
      break;
    case "fill_blank": {
      const ca = q.correctAnswer as { answer?: string } | string | null;
      base.blankAnswer =
        typeof ca === "object" && ca !== null && "answer" in ca ? String(ca.answer ?? "") :
        typeof ca === "string" ? ca : "";
      break;
    }
    case "sorting":
    case "drag_drop":
      base.items = Array.isArray(q.options) ? (q.options as string[]) : ["", "", ""];
      break;
    case "matching": {
      const opts = q.options as { left?: string[]; right?: string[] } | null;
      base.matchLeft = opts?.left ?? ["", ""];
      base.matchRight = opts?.right ?? ["", ""];
      break;
    }
    case "slider": {
      const opts = q.options as { min?: number; max?: number } | null;
      const corr = q.correctAnswer as { value?: number; tolerance?: number } | null;
      base.sliderMin = opts?.min ?? 0;
      base.sliderMax = opts?.max ?? 100;
      base.sliderCorrect = corr?.value ?? 50;
      base.sliderTolerance = corr?.tolerance ?? 5;
      break;
    }
    case "free_text": {
      const corr = q.correctAnswer as { keywords?: string[] } | null;
      base.keywords = corr?.keywords ?? [];
      break;
    }
    case "code_input":
      base.codeTemplate = q.codeTemplate ?? "";
      base.codeSolution = q.codeSolution ?? "";
      base.programmingLanguage = q.programmingLanguage ?? "javascript";
      break;
    case "terminal": {
      const corr = q.correctAnswer as { commands?: string[]; output?: string } | null;
      base.expectedCommands = corr?.commands ?? [""];
      base.expectedOutput = corr?.output ?? "";
      break;
    }
  }

  return base;
}
