"use server";

import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { dbg } from "@/lib/debug";

/**
 * CSV Import — Quiz aus CSV erstellen/aktualisieren
 *
 * Parst CSV mit Fragen + Antworten und erstellt ein neues Quiz.
 * Erwartet das gleiche Format wie der CSV-Export.
 *
 * SECURITY: Nur department_lead+ darf importieren.
 */

interface CSVImportResult {
  quizId: string;
  title: string;
  questionsImported: number;
  errors: string[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function tryParseJSON(value: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function importQuizFromCSV(
  csvContent: string,
  quizTitle?: string,
  quizDescription?: string,
): Promise<CSVImportResult> {
  const session = await requireRole("department_lead");
  const tenantId = session.user.tenantId;

  dbg.quiz("CSV Import", { csvLength: csvContent.length });

  const lines = csvContent.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const errors: string[] = [];

  if (lines.length < 2) {
    throw new Error("CSV muss mindestens Header + 1 Frage enthalten");
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  const typeIdx = header.indexOf("type");
  const textIdx = header.indexOf("text");

  if (typeIdx === -1 || textIdx === -1) {
    throw new Error("CSV Header muss 'type' und 'text' Spalten enthalten");
  }

  // Create column index map
  const colMap = new Map<string, number>();
  header.forEach((col, i) => colMap.set(col.trim(), i));

  function getCol(row: string[], name: string): string {
    const idx = colMap.get(name);
    return idx !== undefined ? (row[idx] ?? "").trim() : "";
  }

  // Create quiz
  const [quiz] = await db
    .insert(quizzes)
    .values({
      title: quizTitle ?? "Importiertes Quiz",
      description: quizDescription ?? "Per CSV importiert",
      mode: "async",
      visibility: "tenant",
      tenantId: tenantId ?? undefined,
      createdBy: session.user.id,
    })
    .returning();

  // Parse and insert questions
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const type = getCol(row, "type");
    const text = getCol(row, "text");

    if (!type || !text) {
      errors.push(`Zeile ${i + 1}: Typ oder Text fehlt — übersprungen`);
      continue;
    }

    try {
      const questionData: Record<string, unknown> = {
        quizId: quiz.id,
        type,
        text,
        points: parseInt(getCol(row, "points")) || 100,
        timeLimit: parseInt(getCol(row, "timeLimit")) || 30,
        sortOrder: imported,
      };

      // Parse optional fields
      const options = getCol(row, "options");
      if (options) questionData.options = tryParseJSON(options);

      const correctAnswer = getCol(row, "correctAnswer");
      if (correctAnswer) questionData.correctAnswer = tryParseJSON(correctAnswer);

      const items = getCol(row, "items");
      if (items) questionData.items = tryParseJSON(items);

      const matchLeft = getCol(row, "matchLeft");
      if (matchLeft) questionData.matchLeft = tryParseJSON(matchLeft);

      const matchRight = getCol(row, "matchRight");
      if (matchRight) questionData.matchRight = tryParseJSON(matchRight);

      const sliderMin = getCol(row, "sliderMin");
      if (sliderMin) questionData.sliderMin = parseInt(sliderMin);

      const sliderMax = getCol(row, "sliderMax");
      if (sliderMax) questionData.sliderMax = parseInt(sliderMax);

      const sliderCorrect = getCol(row, "sliderCorrect");
      if (sliderCorrect) questionData.sliderCorrect = parseInt(sliderCorrect);

      const sliderTolerance = getCol(row, "sliderTolerance");
      if (sliderTolerance) questionData.sliderTolerance = parseInt(sliderTolerance);

      const blankText = getCol(row, "blankText");
      if (blankText) questionData.blankText = blankText;

      const blankAnswers = getCol(row, "blankAnswers");
      if (blankAnswers) questionData.blankAnswers = tryParseJSON(blankAnswers);

      const keywords = getCol(row, "keywords");
      if (keywords) questionData.keywords = tryParseJSON(keywords);

      const codeTemplate = getCol(row, "codeTemplate");
      if (codeTemplate) questionData.codeTemplate = codeTemplate;

      const codeSolution = getCol(row, "codeSolution");
      if (codeSolution) questionData.codeSolution = codeSolution;

      const programmingLanguage = getCol(row, "programmingLanguage");
      if (programmingLanguage) questionData.programmingLanguage = programmingLanguage;

      const referenceUrls = getCol(row, "referenceUrls");
      if (referenceUrls) questionData.referenceUrls = tryParseJSON(referenceUrls);

      const terminalPrompt = getCol(row, "terminalPrompt");
      if (terminalPrompt) questionData.terminalPrompt = terminalPrompt;

      const terminalHint = getCol(row, "terminalHint");
      if (terminalHint) questionData.terminalHint = terminalHint;

      const imageUrls = getCol(row, "imageUrls");
      if (imageUrls) questionData.imageUrls = tryParseJSON(imageUrls);

      await db.insert(questions).values(questionData as typeof questions.$inferInsert);
      imported++;
    } catch (err) {
      errors.push(`Zeile ${i + 1}: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
    }
  }

  dbg.quiz("CSV Import fertig", { quizId: quiz.id, imported, errors: errors.length });

  return {
    quizId: quiz.id,
    title: quiz.title,
    questionsImported: imported,
    errors,
  };
}
