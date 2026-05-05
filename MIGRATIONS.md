# Datenbank-Migrationen

Dieses Projekt nutzt **Drizzle ORM** mit inkrementellen Migrations.
Die `drizzle/` Verzeichnis-Files **müssen committed werden**, sonst
läuft jeder Entwickler in Schema-Drift.

## Standard-Workflow nach Schema-Änderung

```bash
# 1. Schema in src/lib/db/schema/*.ts ändern
# 2. Migration generieren (delta zur letzten gepushten Version):
pnpm db:generate

# 3. WICHTIG: Erzeugte Files committen!
git add drizzle/
git commit -m "feat(db): <was sich geändert hat>"
git push

# 4. Lokal anwenden:
pnpm db:migrate
```

## Standard-Workflow nach `git pull`

```bash
git pull --rebase origin master
pnpm install
pnpm db:migrate    # appliziert NUR neue Migrations, vorhandene Daten bleiben
```

## Notfall: Schema-Drift / Migration-Konflikt

Wenn `pnpm db:migrate` mit "relation already exists" o.ä. abbricht
(z.B. weil jemand mal `db:push --force` gemacht hat oder weil drizzle/
nicht synchron war), nutze das Reset-Script:

```bash
pnpm db:reset    # DROP SCHEMA public CASCADE + migrate + seed
```

⚠️ **`db:reset` löscht alle Daten in der Dev-DB.** Verwende es nur lokal.
Das Script verweigert die Ausführung wenn `NODE_ENV=production`.

## Warum drizzle/ committen?

- Drizzle-Kit liest `drizzle/meta/_journal.json` um zu wissen welche
  Migrations schon erzeugt wurden
- Fehlt das Journal lokal, generiert es immer einen vollen Snapshot
  statt eines Deltas
- Bei mehreren Devs: Schema-Drift garantiert

## Was ist NICHT committed

- `drizzle/meta/.tmp/` (falls drizzle-kit das je anlegt)
- `.env*.local` (DATABASE_URL etc.)
