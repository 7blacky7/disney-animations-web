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
import { eq } from "drizzle-orm";
import { randomUUID, scrypt, randomBytes } from "crypto";
import "dotenv/config";

import { tenants } from "../schema/tenants";
import { departments } from "../schema/departments";
import { users } from "../schema/users";
import { accounts } from "../schema/accounts";
import { quizzes } from "../schema/quizzes";
import { questions } from "../schema/questions";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL nicht gesetzt!");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

/**
 * Generiert einen better-auth kompatiblen Passwort-Hash (scrypt).
 * Format: salt:hex_key (gleiche Params wie better-auth: N=16384, r=16, p=1, dkLen=64)
 */
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 }, (err, key) => {
      if (err) return reject(err);
      resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

async function seed() {
  console.log("🌱 Seeding Datenbank...\n");

  // --- Tenant ---
  // IDEMPOTENT: Prueft ob Tenant bereits existiert (slug unique)
  const tenantId = randomUUID();
  const [existingTenant] = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, "demo-gmbh")).limit(1);
  const finalTenantId = existingTenant?.id ?? tenantId;
  if (!existingTenant) {
    await db.insert(tenants).values({
      id: tenantId,
      name: "Demo GmbH",
      slug: "demo-gmbh",
      primaryColor: "#4338ca",
      accentColor: "#d97706",
    });
    console.log("✅ Tenant: Demo GmbH (neu erstellt)");
  } else {
    console.log("⏭️  Tenant: Demo GmbH (existiert bereits)");
  }

  // --- Departments ---
  // IDEMPOTENT: Prueft ob Abteilungen existieren
  const devDeptId = randomUUID();
  const salesDeptId = randomUUID();
  const existingDepts = await db.select({ id: departments.id, name: departments.name }).from(departments).where(eq(departments.tenantId, finalTenantId));
  const hasDevDept = existingDepts.find((d) => d.name === "Entwicklung");
  const hasSalesDept = existingDepts.find((d) => d.name === "Vertrieb");
  const finalDevDeptId = hasDevDept?.id ?? devDeptId;
  const finalSalesDeptId = hasSalesDept?.id ?? salesDeptId;

  const newDepts = [];
  if (!hasDevDept) newDepts.push({ id: devDeptId, tenantId: finalTenantId, name: "Entwicklung" });
  if (!hasSalesDept) newDepts.push({ id: salesDeptId, tenantId: finalTenantId, name: "Vertrieb" });
  if (newDepts.length > 0) {
    await db.insert(departments).values(newDepts);
    console.log(`✅ Abteilungen: ${newDepts.map((d) => d.name).join(", ")} (neu erstellt)`);
  } else {
    console.log("⏭️  Abteilungen: existieren bereits");
  }

  // --- Users ---
  // Echte better-auth kompatible Passwort-Hashes (scrypt, gleiche Params wie better-auth)
  // Alle Dev-User bekommen Passwort "password123"
  const devPasswordHash = await hashPassword("password123");
  console.log("🔑 Passwort-Hash generiert (password123)");

  // --- Users + Accounts (IDEMPOTENT) ---
  // Prueft ob User per Email existiert, erstellt nur fehlende
  const seedUsers = [
    { email: "super@quizplatform.de", name: "Plattform Admin", role: "super_admin" as const, tenantId: null, departmentId: null },
    { email: "admin@demo-gmbh.de", name: "Anna Admin", role: "admin" as const, tenantId: finalTenantId, departmentId: null },
    { email: "dev-lead@demo-gmbh.de", name: "Daniel Entwickler", role: "department_lead" as const, tenantId: finalTenantId, departmentId: finalDevDeptId },
    { email: "sales-lead@demo-gmbh.de", name: "Sarah Vertrieb", role: "department_lead" as const, tenantId: finalTenantId, departmentId: finalSalesDeptId },
    { email: "max@demo-gmbh.de", name: "Max Mustermann", role: "user" as const, tenantId: finalTenantId, departmentId: finalDevDeptId },
    { email: "lisa@demo-gmbh.de", name: "Lisa Beispiel", role: "user" as const, tenantId: finalTenantId, departmentId: finalSalesDeptId },
  ];

  let createdUsers = 0;
  let createdAccounts = 0;
  for (const seedUser of seedUsers) {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, seedUser.email)).limit(1);
    let userId: string;

    if (existing) {
      userId = existing.id;
      console.log(`⏭️  User: ${seedUser.email} (existiert)`);
    } else {
      userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        tenantId: seedUser.tenantId,
        departmentId: seedUser.departmentId,
        email: seedUser.email,
        name: seedUser.name,
        role: seedUser.role,
        passwordHash: devPasswordHash,
      });
      console.log(`✅ User: ${seedUser.email} (${seedUser.role})`);
      createdUsers++;
    }

    // Account-Eintrag pruefen/erstellen
    const [existingAccount] = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, userId)).limit(1);
    if (!existingAccount) {
      await db.insert(accounts).values({
        userId,
        accountId: userId,
        providerId: "credential",
        password: devPasswordHash,
      });
      createdAccounts++;
    }
  }
  console.log(`✅ ${createdUsers} neue User, ${createdAccounts} neue Accounts (Passwort: password123)`);

  // --- User-IDs fuer Quiz-Erstellung laden ---
  const [adminUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, "admin@demo-gmbh.de")).limit(1);
  const [devLeadUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, "dev-lead@demo-gmbh.de")).limit(1);
  const resolvedAdminId = adminUser?.id ?? randomUUID();
  const resolvedDevLeadId = devLeadUser?.id ?? randomUUID();

  // --- Quizzes (IDEMPOTENT) ---
  const existingQuizzes = await db.select({ title: quizzes.title }).from(quizzes).where(eq(quizzes.tenantId, finalTenantId));
  const existingQuizTitles = new Set(existingQuizzes.map((q) => q.title));

  const quiz1Id = randomUUID();
  const quiz2Id = randomUUID();
  const quiz3Id = randomUUID();
  const quiz4Id = randomUUID();

  const quizDefs = [
    {
      id: quiz1Id,
      tenantId: finalTenantId,
      createdBy: resolvedAdminId,
      title: "JavaScript Grundlagen",
      description: "Teste dein Wissen ueber JavaScript Basics",
      quizMode: "async" as const,
      visibility: "global" as const,
      isPublished: true,
    },
    {
      id: quiz2Id,
      tenantId: finalTenantId,
      departmentId: finalDevDeptId,
      createdBy: resolvedDevLeadId,
      title: "TypeScript Advanced",
      description: "Fortgeschrittene TypeScript Konzepte",
      quizMode: "async" as const,
      visibility: "department" as const,
      isPublished: true,
    },
    {
      id: quiz3Id,
      tenantId: finalTenantId,
      createdBy: resolvedAdminId,
      title: "Firmen-Onboarding",
      description: "Quiz fuer neue Mitarbeiter",
      quizMode: "realtime" as const,
      visibility: "global" as const,
      isPracticeAllowed: false,
      isPublished: true,
    },
    {
      id: quiz4Id,
      tenantId: finalTenantId,
      departmentId: finalDevDeptId,
      createdBy: resolvedDevLeadId,
      title: "Linux & Programmier-Basics",
      description: "Terminal-Befehle und Code-Aufgaben fuer Einsteiger",
      quizMode: "async" as const,
      visibility: "global" as const,
      isPublished: true,
    },
  ];

  const newQuizzes = quizDefs.filter((q) => !existingQuizTitles.has(q.title));
  if (newQuizzes.length > 0) {
    await db.insert(quizzes).values(newQuizzes);
    console.log(`✅ Quizzes: ${newQuizzes.map((q) => q.title).join(", ")}`);
  } else {
    console.log("⏭️  Quizzes: existieren bereits");
  }

  // --- Questions (nur fuer neu erstellte Quizzes) ---
  const questionValues = [
    // Quiz 1: JavaScript Grundlagen
    {
      quizId: quiz1Id,
      type: "multiple_choice" as const,
      content: "Was ist der Unterschied zwischen let und const?",
      options: JSON.stringify(["let ist blockscoped, const nicht", "const kann nicht neu zugewiesen werden", "Kein Unterschied", "let ist schneller"]),
      correctAnswer: JSON.stringify(1),
      order: 1,
      points: 10,
    },
    {
      quizId: quiz1Id,
      type: "true_false" as const,
      content: "JavaScript ist eine streng typisierte Sprache.",
      correctAnswer: JSON.stringify(false),
      order: 2,
      points: 5,
    },
    {
      quizId: quiz1Id,
      type: "fill_blank" as const,
      content: "Die Methode zum Hinzufuegen eines Elements am Ende eines Arrays heisst ___.",
      correctAnswer: JSON.stringify({ answer: "push", alternatives: [".push"] }),
      order: 3,
      points: 10,
    },
    // Quiz 2: TypeScript Advanced
    {
      quizId: quiz2Id,
      type: "multiple_choice" as const,
      content: "Was macht der 'satisfies' Operator in TypeScript?",
      options: JSON.stringify(["Prueft zur Laufzeit", "Validiert den Typ ohne ihn zu verengen", "Erstellt einen neuen Typ", "Konvertiert Typen"]),
      correctAnswer: JSON.stringify(1),
      order: 1,
      points: 15,
    },
    {
      quizId: quiz2Id,
      type: "sorting" as const,
      content: "Sortiere die TypeScript-Versionen chronologisch:",
      options: JSON.stringify(["TypeScript 4.0", "TypeScript 5.0", "TypeScript 3.0", "TypeScript 4.5"]),
      correctAnswer: JSON.stringify([2, 0, 3, 1]),
      order: 2,
      points: 20,
    },
    // Quiz 3: Onboarding
    {
      quizId: quiz3Id,
      type: "multiple_choice" as const,
      content: "Wer ist der Gruender der Demo GmbH?",
      options: JSON.stringify(["Max Mustermann", "Anna Admin", "Der User selbst", "Niemand — es ist eine Demo"]),
      correctAnswer: JSON.stringify(3),
      order: 1,
      points: 5,
      timeLimit: 15,
    },
    {
      quizId: quiz3Id,
      type: "image_choice" as const,
      content: "Welches ist das Logo der Demo GmbH?",
      options: JSON.stringify(["/images/logo-a.png", "/images/logo-b.png", "/images/logo-c.png"]),
      correctAnswer: JSON.stringify(0),
      order: 2,
      points: 10,
      timeLimit: 10,
    },
    // Quiz 4: Linux & Programmier-Basics
    {
      quizId: quiz4Id,
      type: "terminal" as const,
      content: "Liste alle Dateien im aktuellen Verzeichnis auf (inklusive versteckter Dateien).",
      correctAnswer: JSON.stringify({ commands: ["ls -la", "ls -al", "ls -a -l"], output: "total 42\ndrwxr-xr-x 2 user user 4096 Apr 4 12:00 .\ndrwxr-xr-x 3 user user 4096 Apr 4 11:00 ..\n-rw-r--r-- 1 user user  100 Apr 4 12:00 .bashrc\n-rw-r--r-- 1 user user  200 Apr 4 12:00 readme.md" }),
      order: 1,
      points: 10,
    },
    {
      quizId: quiz4Id,
      type: "terminal" as const,
      content: "Erstelle ein neues Verzeichnis namens 'projekt'.",
      correctAnswer: JSON.stringify({ commands: ["mkdir projekt", "mkdir ./projekt"], output: "" }),
      order: 2,
      points: 10,
    },
    {
      quizId: quiz4Id,
      type: "code_input" as const,
      content: "Schreibe eine Funktion die zwei Zahlen addiert und das Ergebnis zurueckgibt.",
      options: null,
      correctAnswer: null,
      order: 3,
      points: 15,
    },
  ];

  // Nur Questions fuer neu erstellte Quizzes einfuegen
  const newQuizIds = new Set(newQuizzes.map((q) => q.id));
  const newQuestions = questionValues.filter((q) => newQuizIds.has(q.quizId));
  if (newQuestions.length > 0) {
    await db.insert(questions).values(newQuestions);
    console.log(`✅ Fragen: ${newQuestions.length} neue Fragen`);
  } else {
    console.log("⏭️  Fragen: existieren bereits");
  }

  console.log("\n🎉 Seed abgeschlossen!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed fehlgeschlagen:", err);
  process.exit(1);
});
