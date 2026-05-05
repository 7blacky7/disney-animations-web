/**
 * Reset-Script — DROP + recreate public schema.
 *
 * Für Schema-Drift / Migration-Konflikte. Verweigert sich in Production.
 * Anschließend kettet package.json db:reset noch db:migrate + db:seed an.
 */

import "dotenv/config";
import postgres from "postgres";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ db:reset ist in NODE_ENV=production gesperrt.");
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL nicht gesetzt.");
    process.exit(1);
  }

  // Sanity-Check: niemals gegen synapse-DB feuern (Daemon-Env-Bug-Schutz)
  if (url.includes("@192.168.50.65:5432/synapse") || url.includes("/synapse?") || url.endsWith("/synapse")) {
    console.error("❌ DATABASE_URL zeigt auf synapse — abgebrochen.");
    process.exit(1);
  }

  const dbName = (() => {
    try {
      return new URL(url).pathname.replace(/^\//, "");
    } catch {
      return "";
    }
  })();

  console.log(`⚠️  Reset der Datenbank "${dbName}" — alle Daten gehen verloren.`);

  const sql = postgres(url, { max: 1 });
  try {
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE");
    await sql.unsafe("CREATE SCHEMA public");
    await sql.unsafe("GRANT ALL ON SCHEMA public TO public");
    console.log("✅ public schema neu angelegt.");
    console.log("   Nächster Schritt läuft automatisch: db:migrate + db:seed");
  } catch (err) {
    console.error("❌ Reset fehlgeschlagen:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
