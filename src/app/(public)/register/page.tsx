"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signUp } from "@/lib/auth/client";
import { dbg } from "@/lib/debug";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING, TIMING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * Register Page — Neue Benutzer Registrierung
 */

export default function RegisterPage() {
  const { prefersReducedMotion } = useAccessibility();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    dbg.auth("Registrierung-Versuch", { email, name });

    if (password.length < 8) {
      dbg.auth.warn("Passwort zu kurz", { email, length: password.length });
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        dbg.auth.warn("Registrierung fehlgeschlagen", { email, error: result.error.message });
        setError(result.error.message ?? "Registrierung fehlgeschlagen");
        setIsLoading(false);
        return;
      }

      dbg.auth("Registrierung erfolgreich", { email, name });
      router.push("/dashboard");
    } catch (err) {
      dbg.auth.error("Registrierung-Fehler", { email, error: err });
      setError("Ein unerwarteter Fehler ist aufgetreten");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { ...SPRING.snappy }}
        className={cn(
          "w-full max-w-md rounded-2xl border border-border/50",
          "bg-card/80 p-8 shadow-xl backdrop-blur-sm",
        )}
      >
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold">Konto erstellen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registriere dich fuer die Quiz-Plattform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3 py-2.5",
                "text-sm placeholder:text-muted-foreground/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
              placeholder="Max Mustermann"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3 py-2.5",
                "text-sm placeholder:text-muted-foreground/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
              placeholder="name@firma.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3 py-2.5",
                "text-sm placeholder:text-muted-foreground/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
              placeholder="Mindestens 8 Zeichen"
            />
          </div>

          {error && (
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: TIMING.instant }}
            className={cn(
              "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
              "transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isLoading && "cursor-not-allowed opacity-60",
            )}
          >
            {isLoading ? "Wird registriert..." : "Registrieren"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Bereits registriert?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Anmelden
          </Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          ← Zur Startseite
        </Link>
      </motion.div>
    </div>
  );
}
