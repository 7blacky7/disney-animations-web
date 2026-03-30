/**
 * Dashboard Overview — Main landing page after login
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Willkommen zurueck! Hier ist deine Uebersicht.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Aktive Quizzes", value: "12" },
          { label: "Benutzer", value: "48" },
          { label: "Abgeschlossen", value: "156" },
          { label: "Durchschnitt", value: "78%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/40 bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm text-muted-foreground/60">Aktivitaets-Feed folgt</p>
      </div>
    </div>
  );
}
