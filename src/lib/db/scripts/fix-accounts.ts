/**
 * Fix-Script: Account-Eintraege fuer bestehende User nachtraeglich erstellen.
 *
 * Problem: Alte Seed-Daten haben User OHNE Account-Eintrag in der account-Tabelle.
 * better-auth speichert Passwoerter in account.password, nicht in users.passwordHash.
 * Ohne Account-Eintrag ist Login unmoeglich.
 *
 * Ausfuehren:
 *   DATABASE_URL="postgresql://postgres:quiz123@localhost:5432/quizplatform" pnpm tsx src/lib/db/scripts/fix-accounts.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { scrypt, randomBytes } from "crypto";
import { eq, sql } from "drizzle-orm";
import "dotenv/config";

import { users } from "../schema/users";
import { accounts } from "../schema/accounts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL nicht gesetzt!");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

/**
 * Generiert einen better-auth kompatiblen Passwort-Hash (scrypt).
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

async function fixAccounts() {
  console.log("🔧 Pruefe fehlende Account-Eintraege...\n");

  // Alle User laden
  const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);
  console.log(`📋 ${allUsers.length} User in der Datenbank`);

  // Pruefen welche User KEINEN Account-Eintrag haben
  let fixedCount = 0;
  const devPasswordHash = await hashPassword("password123");

  for (const user of allUsers) {
    const [existingAccount] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (!existingAccount) {
      console.log(`  ❌ ${user.email} (${user.name}) — KEIN Account → wird erstellt`);
      await db.insert(accounts).values({
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: devPasswordHash,
      });
      fixedCount++;
    } else {
      console.log(`  ✅ ${user.email} (${user.name}) — Account vorhanden`);
    }
  }

  console.log(`\n✅ ${fixedCount} fehlende Account-Eintraege erstellt (Passwort: password123)`);
  console.log("🔑 Login sollte jetzt fuer alle User funktionieren.");

  await client.end();
}

fixAccounts().catch((err) => {
  console.error("Fehler:", err);
  process.exit(1);
});
