"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "@/lib/auth/client";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING, TIMING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * Login Page — Email/Password Authentication
 *
 * Disney Principles:
 * - Staging: Centered card on gradient background
 * - Anticipation: Button scales on hover
 * - Follow Through: Spring on form entrance
 * - Appeal: Clean, professional design
 */

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Laden...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { prefersReducedMotion } = useAccessibility();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Anmeldung fehlgeschlagen");
        setIsLoading(false);
        return;
      }

      router.push(redirect);
    } catch {
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
          <h1 className="font-heading text-2xl font-bold">Willkommen zurueck</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Melde dich an um fortzufahren
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              className={cn(
                "w-full rounded-lg border border-border bg-background px-3 py-2.5",
                "text-sm placeholder:text-muted-foreground/60",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              )}
              placeholder="Passwort eingeben"
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
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            Registrieren
          </a>
        </p>
      </motion.div>
    </div>
  );
}
