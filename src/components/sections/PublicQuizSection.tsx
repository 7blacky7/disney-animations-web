"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";

/**
 * PublicQuizSection — Zeigt oeffentliche Quizzes auf der Landing Page.
 *
 * Animation Principles:
 * - Staging: Section-Header fuehrt den Blick
 * - Timing: Staggered card reveals
 * - Appeal: Einladende Quiz-Karten mit Play-CTA
 */

interface PublicQuiz {
  id: string;
  title: string;
  description: string | null;
  quizMode: string;
}

interface PublicQuizSectionProps {
  quizzes: PublicQuiz[];
}

export function PublicQuizSection({ quizzes }: PublicQuizSectionProps) {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <section className="py-[var(--section-gap)] px-6" id="public-quizzes">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal direction="up" distance={20}>
          <div className="text-center mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              Jetzt spielen
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Verfuegbare Quizzes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Teste dein Wissen — ganz ohne Anmeldung.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div
                className={cn(
                  "group flex flex-col rounded-2xl border border-border/40 bg-card/80 p-6",
                  "backdrop-blur-sm transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                    {quiz.quizMode === "realtime" ? "Echtzeit" : "Asynchron"}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Oeffentlich
                  </span>
                </div>

                <h3 className="font-heading text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                  {quiz.title}
                </h3>

                {quiz.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {quiz.description}
                  </p>
                )}

                <div className="mt-auto pt-5">
                  <Link href={`/play/${quiz.id}`}>
                    <AnimatedButton shine className="w-full">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Quiz starten
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
