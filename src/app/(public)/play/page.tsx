import Link from "next/link";
import { db } from "@/lib/db";
import { quizzes, tenants, learningPaths, learningPathLevels } from "@/lib/db/schema";
import { eq, and, desc, count, asc } from "drizzle-orm";

/**
 * Play Index — Oeffentliche Quiz- und Lernpfad-Uebersicht.
 *
 * Zeigt alle publizierten, globalen Quizzes und Lernpfade.
 * Kein Login erforderlich — oeffentliche Seite.
 * Respektiert Quiz-Attribution (Firmenname oder anonym).
 */

export default async function PlayIndexPage() {
  // Oeffentliche Quizzes laden (global + published)
  const publicQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      quizMode: quizzes.quizMode,
      tenantName: tenants.name,
      quizAttribution: tenants.quizAttribution,
    })
    .from(quizzes)
    .innerJoin(tenants, eq(quizzes.tenantId, tenants.id))
    .where(
      and(
        eq(quizzes.visibility, "global"),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt))
    .limit(20)
    .catch(() => []);

  // Oeffentliche Lernpfade laden (published)
  const publicPaths = await db
    .select({
      id: learningPaths.id,
      title: learningPaths.title,
      description: learningPaths.description,
      language: learningPaths.language,
      tenantName: tenants.name,
      quizAttribution: tenants.quizAttribution,
      levelCount: count(learningPathLevels.id),
    })
    .from(learningPaths)
    .innerJoin(tenants, eq(learningPaths.tenantId, tenants.id))
    .leftJoin(learningPathLevels, eq(learningPathLevels.learningPathId, learningPaths.id))
    .where(eq(learningPaths.isPublished, true))
    .groupBy(learningPaths.id, tenants.name, tenants.quizAttribution)
    .orderBy(asc(learningPaths.sortOrder))
    .limit(20)
    .catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-heading text-lg font-bold">
            Quiz Platform
          </Link>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Registrieren
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Quizzes &amp; Lernpfade
          </h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Teste dein Wissen mit interaktiven Quizzes oder arbeite dich durch
            strukturierte Lernpfade. Kein Account noetig zum Spielen.
          </p>
        </div>

        {/* Lernpfade */}
        {publicPaths.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Lernpfade</h2>
              <span className="text-xs text-muted-foreground">{publicPaths.length} verfuegbar</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicPaths.map((path) => (
                <div
                  key={path.id}
                  className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </span>
                    <h3 className="font-heading text-sm font-semibold leading-tight">{path.title}</h3>
                  </div>
                  {path.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{path.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-chart-2/10 px-2 py-0.5 text-[10px] font-medium text-chart-2">
                      {path.levelCount} Stufen
                    </span>
                    {path.language && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {path.language}
                      </span>
                    )}
                  </div>
                  {path.quizAttribution === "named" && path.tenantName && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      von {path.tenantName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quizzes */}
        {publicQuizzes.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Quizzes</h2>
              <span className="text-xs text-muted-foreground">{publicQuizzes.length} verfuegbar</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border"
                >
                  <h3 className="font-heading text-sm font-semibold leading-tight">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{quiz.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {quiz.quizMode === "realtime" ? "Echtzeit" : "Asynchron"}
                    </span>
                  </div>
                  {quiz.quizAttribution === "named" && quiz.tenantName && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      von {quiz.tenantName}
                    </p>
                  )}
                  <Link
                    href={`/play/${quiz.id}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Spielen
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {publicQuizzes.length === 0 && publicPaths.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
            <p className="text-muted-foreground">
              Noch keine oeffentlichen Quizzes oder Lernpfade verfuegbar.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Jetzt registrieren
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
