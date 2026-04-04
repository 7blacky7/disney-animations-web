/**
 * Seed Script — Demo-Daten fuer Entwicklung
 *
 * Erstellt:
 * - 1 Tenant (Demo GmbH)
 * - 2 Abteilungen (Entwicklung, Vertrieb)
 * - 5 User (1 Admin, 2 Abteilungsleiter, 2 User)
 * - 3 Quizzes mit Fragen
 *
 * Ausfuehren: pnpm db:seed
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "crypto";
import "dotenv/config";

import { tenants } from "../schema/tenants";
import { departments } from "../schema/departments";
import { users } from "../schema/users";
import { quizzes } from "../schema/quizzes";
import { questions } from "../schema/questions";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL nicht gesetzt!");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding Datenbank...\n");

  // --- Tenant ---
  const tenantId = randomUUID();
  await db.insert(tenants).values({
    id: tenantId,
    name: "Demo GmbH",
    slug: "demo-gmbh",
    primaryColor: "#4338ca",
    accentColor: "#d97706",
  });
  console.log("✅ Tenant: Demo GmbH");

  // --- Departments ---
  const devDeptId = randomUUID();
  const salesDeptId = randomUUID();
  await db.insert(departments).values([
    { id: devDeptId, tenantId, name: "Entwicklung" },
    { id: salesDeptId, tenantId, name: "Vertrieb" },
  ]);
  console.log("✅ Abteilungen: Entwicklung, Vertrieb");

  // --- Users ---
  // Passwort-Hash fuer "password123" (bcrypt) — nur fuer Dev!
  const devPasswordHash = "$2b$10$dummyhashfordevonlynotforproduction000000000000000";

  const adminId = randomUUID();
  const devLeadId = randomUUID();
  const salesLeadId = randomUUID();
  const user1Id = randomUUID();
  const user2Id = randomUUID();

  await db.insert(users).values([
    {
      id: adminId,
      tenantId,
      email: "admin@demo-gmbh.de",
      name: "Anna Admin",
      role: "admin",
      passwordHash: devPasswordHash,
    },
    {
      id: devLeadId,
      tenantId,
      departmentId: devDeptId,
      email: "dev-lead@demo-gmbh.de",
      name: "Daniel Entwickler",
      role: "department_lead",
      passwordHash: devPasswordHash,
    },
    {
      id: salesLeadId,
      tenantId,
      departmentId: salesDeptId,
      email: "sales-lead@demo-gmbh.de",
      name: "Sarah Vertrieb",
      role: "department_lead",
      passwordHash: devPasswordHash,
    },
    {
      id: user1Id,
      tenantId,
      departmentId: devDeptId,
      email: "max@demo-gmbh.de",
      name: "Max Mustermann",
      role: "user",
      passwordHash: devPasswordHash,
    },
    {
      id: user2Id,
      tenantId,
      departmentId: salesDeptId,
      email: "lisa@demo-gmbh.de",
      name: "Lisa Beispiel",
      role: "user",
      passwordHash: devPasswordHash,
    },
  ]);
  console.log("✅ User: Anna Admin, Daniel, Sarah, Max, Lisa");

  // --- Quizzes ---
  const quiz1Id = randomUUID();
  const quiz2Id = randomUUID();
  const quiz3Id = randomUUID();

  await db.insert(quizzes).values([
    {
      id: quiz1Id,
      tenantId,
      createdBy: adminId,
      title: "JavaScript Grundlagen",
      description: "Teste dein Wissen ueber JavaScript Basics",
      quizMode: "async",
      visibility: "global",
      isPublished: true,
    },
    {
      id: quiz2Id,
      tenantId,
      departmentId: devDeptId,
      createdBy: devLeadId,
      title: "TypeScript Advanced",
      description: "Fortgeschrittene TypeScript Konzepte",
      quizMode: "async",
      visibility: "department",
      isPublished: true,
    },
    {
      id: quiz3Id,
      tenantId,
      createdBy: adminId,
      title: "Firmen-Onboarding",
      description: "Quiz fuer neue Mitarbeiter",
      quizMode: "realtime",
      visibility: "global",
      isPracticeAllowed: false,
      isPublished: true,
    },
  ]);
  console.log("✅ Quizzes: JS Grundlagen, TS Advanced, Onboarding");

  // --- Questions ---
  await db.insert(questions).values([
    // Quiz 1: JavaScript Grundlagen
    {
      quizId: quiz1Id,
      type: "multiple_choice",
      content: "Was ist der Unterschied zwischen let und const?",
      options: JSON.stringify(["let ist blockscoped, const nicht", "const kann nicht neu zugewiesen werden", "Kein Unterschied", "let ist schneller"]),
      correctAnswer: JSON.stringify(1),
      order: 1,
      points: 10,
    },
    {
      quizId: quiz1Id,
      type: "true_false",
      content: "JavaScript ist eine streng typisierte Sprache.",
      correctAnswer: JSON.stringify(false),
      order: 2,
      points: 5,
    },
    {
      quizId: quiz1Id,
      type: "fill_blank",
      content: "Die Methode zum Hinzufuegen eines Elements am Ende eines Arrays heisst ___.",
      correctAnswer: JSON.stringify("push"),
      order: 3,
      points: 10,
    },
    // Quiz 2: TypeScript Advanced
    {
      quizId: quiz2Id,
      type: "multiple_choice",
      content: "Was macht der 'satisfies' Operator in TypeScript?",
      options: JSON.stringify(["Prueft zur Laufzeit", "Validiert den Typ ohne ihn zu verengen", "Erstellt einen neuen Typ", "Konvertiert Typen"]),
      correctAnswer: JSON.stringify(1),
      order: 1,
      points: 15,
    },
    {
      quizId: quiz2Id,
      type: "sorting",
      content: "Sortiere die TypeScript-Versionen chronologisch:",
      options: JSON.stringify(["TypeScript 4.0", "TypeScript 5.0", "TypeScript 3.0", "TypeScript 4.5"]),
      correctAnswer: JSON.stringify([2, 0, 3, 1]),
      order: 2,
      points: 20,
    },
    // Quiz 3: Onboarding
    {
      quizId: quiz3Id,
      type: "multiple_choice",
      content: "Wer ist der Gruender der Demo GmbH?",
      options: JSON.stringify(["Max Mustermann", "Anna Admin", "Der User selbst", "Niemand — es ist eine Demo"]),
      correctAnswer: JSON.stringify(3),
      order: 1,
      points: 5,
      timeLimit: 15,
    },
    {
      quizId: quiz3Id,
      type: "image_choice",
      content: "Welches ist das Logo der Demo GmbH?",
      options: JSON.stringify(["/images/logo-a.png", "/images/logo-b.png", "/images/logo-c.png"]),
      correctAnswer: JSON.stringify(0),
      order: 2,
      points: 10,
      timeLimit: 10,
    },
  ]);
  console.log("✅ Fragen: 7 Fragen ueber 3 Quizzes");

  console.log("\n🎉 Seed abgeschlossen!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed fehlgeschlagen:", err);
  process.exit(1);
});
