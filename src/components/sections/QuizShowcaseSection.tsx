"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { QUIZ_SPRING } from "@/animations/variants/quiz";
import {
  MCIcon,
  DragDropIcon,
  MatchingIcon,
  SliderIcon,
  FillInIcon,
  FreetextIcon,
  TrueFalseIcon,
  ImageChoiceIcon,
  SortingIcon,
  TimerIcon,
} from "@/components/icons/QuizIcons";
import { cn } from "@/lib/utils";

/**
 * QuizShowcaseSection — Bento-Grid Layout mit 10 Quiz-Typ Demos
 *
 * KERNSTÜCK der Landing Page. Apple/Linear-Style asymmetrisches Grid.
 * Ersetzt den buggy GSAP-Horizontal-Scroll durch ein robustes CSS Grid.
 *
 * Layout: 4 Spalten Desktop, 2 Tablet, 1 Mobile
 * - 3 Hero-Karten (2x Breite): MC, DragDrop, Timer
 * - 7 Standard-Karten: rest
 * - Scroll-reveal Stagger Entrance
 *
 * Disney Principles:
 * - Staging: staggered reveal draws attention sequentially
 * - Timing: 6s auto-loop per demo
 * - Follow-through: overshoot-ease on hover
 * - Appeal: asymmetric, playful, professional
 *
 * RULE: All 3+ keyframe animations use type:"tween" (NOT spring!)
 */

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  hue: string;
  /** Grid span: "wide" = col-span-2, "tall" = row-span-2 */
  size: "normal" | "wide";
}

const OVERSHOOT = { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const };

const quizTypes: QuizType[] = [
  {
    id: "mc",
    title: "Multiple Choice",
    description: "Klassische Auswahlfragen mit animiertem Feedback",
    icon: MCIcon,
    gradient: "from-primary/12 via-primary/6 to-transparent",
    hue: "var(--primary)",
    size: "wide",
  },
  {
    id: "truefalse",
    title: "Wahr / Falsch",
    description: "Binaere Entscheidung mit Flip-Animation",
    icon: TrueFalseIcon,
    gradient: "from-chart-1/12 via-chart-1/6 to-transparent",
    hue: "var(--chart-1)",
    size: "normal",
  },
  {
    id: "slider",
    title: "Slider",
    description: "Werte auf einem Regler einschaetzen",
    icon: SliderIcon,
    gradient: "from-chart-4/12 via-chart-4/6 to-transparent",
    hue: "var(--chart-4)",
    size: "normal",
  },
  {
    id: "dragdrop",
    title: "Drag & Drop",
    description: "Elemente per Drag in die richtige Kategorie",
    icon: DragDropIcon,
    gradient: "from-chart-3/15 via-chart-3/6 to-transparent",
    hue: "var(--chart-3)",
    size: "normal",
  },
  {
    id: "matching",
    title: "Matching",
    description: "Zusammengehoerige Paare verbinden",
    icon: MatchingIcon,
    gradient: "from-chart-2/12 via-chart-2/6 to-transparent",
    hue: "var(--chart-2)",
    size: "normal",
  },
  {
    id: "fillin",
    title: "Lueckentext",
    description: "Fehlende Woerter im Kontext ergaenzen",
    icon: FillInIcon,
    gradient: "from-accent/20 via-accent/8 to-transparent",
    hue: "var(--accent)",
    size: "wide",
  },
  {
    id: "image",
    title: "Bildauswahl",
    description: "Antworten anhand von Bildern erkennen",
    icon: ImageChoiceIcon,
    gradient: "from-primary/10 via-chart-4/6 to-transparent",
    hue: "var(--primary)",
    size: "normal",
  },
  {
    id: "freetext",
    title: "Freitext",
    description: "Offene Antworten in eigenen Worten",
    icon: FreetextIcon,
    gradient: "from-chart-5/12 via-chart-5/6 to-transparent",
    hue: "var(--chart-5)",
    size: "normal",
  },
  {
    id: "sorting",
    title: "Reihenfolge",
    description: "Elemente in die richtige Reihenfolge bringen",
    icon: SortingIcon,
    gradient: "from-chart-2/12 via-chart-5/6 to-transparent",
    hue: "var(--chart-2)",
    size: "normal",
  },
  {
    id: "timer",
    title: "Zeitdruck",
    description: "Schnell antworten bevor die Zeit ablaeuft",
    icon: TimerIcon,
    gradient: "from-destructive/10 via-chart-3/6 to-transparent",
    hue: "var(--destructive)",
    size: "wide",
  },
];

// ---------------------------------------------------------------------------
// Auto-loop hook
// ---------------------------------------------------------------------------

function useAutoLoop(steps: number, intervalMs: number, isPaused: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setStep((p) => (p + 1) % steps);
    }, intervalMs);
    return () => clearInterval(id);
  }, [steps, intervalMs, isPaused]);

  return step;
}

// ---------------------------------------------------------------------------
// Stagger Container Variants (tween-based, NOT spring)
// ---------------------------------------------------------------------------

const gridContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const gridItemVariants = {
  hidden: { y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function QuizShowcaseSection() {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <section id="showcase" className="py-[var(--section-gap)] px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <ScrollReveal direction="up" distance={24} className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            10 Interaktive Quiz-Typen
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Jeder Quiz — ein Erlebnis
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Von Multiple Choice bis Zeitdruck. Jeder Typ nutzt einzigartige
            Disney-Animationsprinzipien fuer lebendige Interaktionen.
          </p>
        </ScrollReveal>

        {/* Bento Grid */}
        <motion.div
          variants={prefersReducedMotion ? undefined : gridContainerVariants}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.05 }}
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            "auto-rows-[minmax(320px,auto)]",
          )}
        >
          {quizTypes.map((qt, i) => (
            <motion.div
              key={qt.id}
              variants={prefersReducedMotion ? undefined : gridItemVariants}
              className={cn(
                qt.size === "wide" && "sm:col-span-2",
              )}
            >
              <BentoCard quiz={qt} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Bento Card
// ---------------------------------------------------------------------------

function BentoCard({ quiz, index }: { quiz: QuizType; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { prefersReducedMotion } = useAccessibility();
  const isPaused = isHovered || prefersReducedMotion;

  const IconComponent = quiz.icon;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={{ ...QUIZ_SPRING.pop }}
      className={cn(
        "group relative flex h-full flex-col",
        "overflow-hidden rounded-2xl",
        "border border-border/40",
        "bg-gradient-to-br",
        quiz.gradient,
        "shadow-sm hover:shadow-lg hover:shadow-foreground/[0.04]",
        "transition-shadow duration-300",
      )}
    >
      {/* Decorative glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        )}
        style={{ backgroundColor: `color-mix(in oklch, ${quiz.hue} 15%, transparent)` }}
        aria-hidden="true"
      />

      {/* Card header */}
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Prominent animated icon */}
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                color: quiz.hue,
                backgroundColor: `color-mix(in oklch, ${quiz.hue} 10%, transparent)`,
              }}
              aria-hidden="true"
            >
              <IconComponent className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold leading-tight">{quiz.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{quiz.description}</p>
            </div>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: `color-mix(in oklch, ${quiz.hue} 10%, transparent)`,
              color: quiz.hue,
            }}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Demo area */}
      <div className="relative z-10 flex flex-1 items-center px-5 pb-5">
        <div className={cn(
          "w-full rounded-xl p-4",
          "border border-border/20 bg-background/60 backdrop-blur-sm",
        )}>
          <DemoRenderer id={quiz.id} isPaused={isPaused} hue={quiz.hue} />
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-2.5 right-3 z-10">
        <span className={cn(
          "flex items-center gap-1 text-[9px] text-muted-foreground/40",
          "transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-50",
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isHovered ? "bg-muted-foreground/30" : "bg-success/50",
          )} />
          {isHovered ? "Pausiert" : "Live"}
        </span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Demo Renderer
// ---------------------------------------------------------------------------

function DemoRenderer({ id, isPaused, hue }: { id: string; isPaused: boolean; hue: string }) {
  switch (id) {
    case "mc": return <MCDemo isPaused={isPaused} />;
    case "dragdrop": return <DragDropDemo isPaused={isPaused} />;
    case "matching": return <MatchingDemo isPaused={isPaused} />;
    case "slider": return <SliderDemo isPaused={isPaused} hue={hue} />;
    case "fillin": return <FillInDemo isPaused={isPaused} />;
    case "freetext": return <FreetextDemo isPaused={isPaused} />;
    case "truefalse": return <TrueFalseDemo isPaused={isPaused} />;
    case "image": return <ImageChoiceDemo isPaused={isPaused} />;
    case "sorting": return <SortingDemo isPaused={isPaused} />;
    case "timer": return <TimerDemo isPaused={isPaused} hue={hue} />;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Multiple Choice
// ---------------------------------------------------------------------------

const mcOpts = ["Squash & Stretch", "Staging", "Anticipation", "Follow Through"];

function MCDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(8, 750, isPaused);
  const selected = step >= 1 && step <= 3 ? step - 1 : step >= 4 && step <= 6 ? 2 : -1;
  const confirmed = step >= 5 && step <= 7;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Welches Prinzip kommt vor der Aktion?</p>
      {mcOpts.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = confirmed && i === 2;
        const isWrong = confirmed && isSelected && i !== 2;

        return (
          <motion.div
            key={opt}
            animate={{
              scale: isSelected && !confirmed ? 1.03 : 1,
              x: isWrong ? [0, -4, 4, -2, 0] : 0,
            }}
            transition={isWrong ? { duration: 0.3 } : { ...QUIZ_SPRING.pop }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
              !isSelected && "border-border/40",
              isSelected && !confirmed && "border-primary/40 bg-primary/5",
              isCorrect && "border-success/50 bg-success/10",
              isWrong && "border-destructive/40 bg-destructive/5",
            )}
          >
            <span className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
              isCorrect ? "bg-success text-white" :
              isWrong ? "bg-destructive text-white" :
              isSelected ? "bg-primary text-primary-foreground" :
              "border border-muted-foreground/30 text-muted-foreground",
            )}>
              {isCorrect ? <CheckSvg className="h-2 w-2" /> : isWrong ? <CrossSvg className="h-2 w-2" /> : String.fromCharCode(65 + i)}
            </span>
            <span className={cn(isSelected && "font-medium")}>{opt}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Drag & Drop
// ---------------------------------------------------------------------------

function DragDropDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(4, 1500, isPaused);
  const order = useMemo(() => {
    const sequences = [[1, 0, 2], [1, 2, 0], [2, 1, 0], [0, 1, 2]];
    return sequences[step] ?? [0, 1, 2];
  }, [step]);

  const items = ["Timing", "Spacing", "Appeal"];

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Sortiere nach Wichtigkeit:</p>
      {order.map((idx, pos) => (
        <motion.div
          key={items[idx]}
          layout
          transition={OVERSHOOT}
          className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/60 px-3 py-2 text-xs"
        >
          <span className="text-muted-foreground/50 font-mono text-[10px]">{pos + 1}</span>
          <GripIcon />
          <span className="font-medium">{items[idx]}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Matching
// ---------------------------------------------------------------------------

function MatchingDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(6, 1000, isPaused);
  const matched = step >= 1 ? Math.min(step, 3) : 0;

  const left = ["Bounce", "Elastic", "Power2"];
  const right = ["Spring", "Snap", "Smooth"];

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Verbinde die Easing-Paare:</p>
      {left.map((l, i) => {
        const isConnected = i < matched;
        return (
          <div key={l} className="flex items-center gap-2">
            <motion.span
              animate={{ scale: isConnected ? 1.02 : 1 }}
              transition={{ ...QUIZ_SPRING.pop }}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs text-center",
                isConnected ? "border-primary/40 bg-primary/5 font-medium" : "border-border/40",
              )}
            >
              {l}
            </motion.span>
            <motion.div
              animate={{ scaleX: isConnected ? 1 : 0, opacity: isConnected ? 1 : 0.3 }}
              transition={OVERSHOOT}
              className="h-px w-6 origin-left bg-primary"
            />
            <motion.span
              animate={{ scale: isConnected ? 1.02 : 1 }}
              transition={{ ...QUIZ_SPRING.pop }}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs text-center",
                isConnected ? "border-primary/40 bg-primary/5 font-medium" : "border-border/40",
              )}
            >
              {right[i]}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Slider
// ---------------------------------------------------------------------------

function SliderDemo({ isPaused, hue }: { isPaused: boolean; hue: string }) {
  const step = useAutoLoop(5, 1200, isPaused);
  const values = [25, 55, 80, 45, 25];
  const val = values[step] ?? 25;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold">Wie sicher bist du?</p>
      <motion.p
        key={val}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={OVERSHOOT}
        className="text-center font-heading text-3xl font-bold"
        style={{ color: hue }}
      >
        {val}%
      </motion.p>
      <div className="relative h-2 rounded-full bg-muted">
        <motion.div
          animate={{ scaleX: val / 100 }}
          transition={OVERSHOOT}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: hue }}
        />
        <motion.div
          animate={{
            x: `${val}%`,
            scaleX: [1, 0.8, 1],
            scaleY: [1, 1.2, 1],
          }}
          transition={OVERSHOOT}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-md"
          style={{ backgroundColor: hue }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Unsicher</span>
        <span>Sehr sicher</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Lueckentext
// ---------------------------------------------------------------------------

function FillInDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(6, 1000, isPaused);
  const words = ["S", "Sp", "Spr", "Spri", "Sprin", "Spring"];
  const typed = step <= 5 ? words[step] : "Spring";
  const showCursor = step < 5;
  const showCheck = step >= 5;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Ergaenze das fehlende Wort:</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Eine <span className="font-medium text-foreground">___</span>-Animation
        erzeugt natuerliche Bewegung durch Federkraft.
      </p>
      <motion.div
        animate={showCheck ? { scale: [1, 1.05, 1] } : {}}
        transition={OVERSHOOT}
        className={cn(
          "flex items-center rounded-xl border px-3 py-2",
          showCheck ? "border-success/40 bg-success/5" : "border-primary/30 bg-primary/5",
        )}
      >
        <span className="font-mono text-sm font-medium">{typed}</span>
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-px inline-block h-4 w-px bg-primary"
          />
        )}
        {showCheck && <span className="ml-auto text-success"><CheckSvg className="h-3.5 w-3.5" /></span>}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Freitext
// ---------------------------------------------------------------------------

function FreetextDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(8, 750, isPaused);
  const fullText = "Anticipation bereitet den Zuschauer auf eine bevorstehende Aktion vor.";
  const charCount = Math.min(step * 10, fullText.length);
  const text = fullText.slice(0, charCount);
  const isDone = charCount >= fullText.length;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Erklaere das Prinzip in eigenen Worten:</p>
      <div className={cn(
        "min-h-[60px] rounded-xl border px-3 py-2 text-xs leading-relaxed",
        isDone ? "border-primary/30 bg-primary/5" : "border-border/40",
      )}>
        <span>{text}</span>
        {!isDone && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block h-3 w-px bg-foreground ml-px"
          />
        )}
      </div>
      {isDone && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...QUIZ_SPRING.pop }}
          className="flex items-center gap-1.5 text-[10px] text-primary font-medium"
        >
          <SparkleSvg className="h-3 w-3 inline-block" />
          {" "}Gespeichert
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Wahr / Falsch
// ---------------------------------------------------------------------------

function TrueFalseDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(6, 1000, isPaused);
  const selection = step >= 2 && step <= 3 ? "true" : step >= 4 ? "false" : null;
  const revealed = step >= 3;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Wahr oder Falsch?</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        &quot;Follow Through bedeutet, dass Objekte abrupt stoppen.&quot;
      </p>
      <div className="flex gap-2">
        {(["true", "false"] as const).map((opt) => {
          const isSelected = selection === opt;
          const isCorrectReveal = revealed && opt === "false";
          const isWrongReveal = revealed && isSelected && opt === "true";

          return (
            <motion.button
              key={opt}
              animate={{
                scale: isSelected && !revealed ? [1, 1.08, 1] : 1,
                rotate: isWrongReveal ? [0, -3, 3, 0] : 0,
              }}
              transition={OVERSHOOT}
              className={cn(
                "flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wider",
                !isSelected && "border-border/40 text-muted-foreground",
                isSelected && !revealed && "border-primary/40 bg-primary/10 text-primary",
                isCorrectReveal && "border-success/50 bg-success/10 text-success-foreground",
                isWrongReveal && "border-destructive/40 bg-destructive/5 text-destructive",
              )}
            >
              {opt === "true" ? "Wahr" : "Falsch"}
              {isCorrectReveal && <> <CheckSvg className="inline h-2.5 w-2.5" /></>}
              {isWrongReveal && <> <CrossSvg className="inline h-2.5 w-2.5" /></>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Bildauswahl
// ---------------------------------------------------------------------------

const imageLabels = ["Bounce", "Elastic", "Smooth", "Linear"];
const imageColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function ImageChoiceDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(6, 1000, isPaused);
  const selected = step >= 2 && step <= 4 ? 1 : -1;
  const confirmed = step >= 4;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold">Welche Kurve zeigt Spring-Easing?</p>
      <div className="grid grid-cols-2 gap-2">
        {imageLabels.map((label, i) => {
          const isActive = selected === i;
          const isCorrect = confirmed && i === 1;

          return (
            <motion.div
              key={label}
              animate={{
                scale: isActive ? 1.04 : 1,
                rotate: isCorrect ? [0, -2, 2, 0] : 0,
              }}
              transition={OVERSHOOT}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2",
                !isActive && "border-border/40",
                isActive && !confirmed && "border-primary/40 ring-1 ring-primary/20",
                isCorrect && "border-success/50 ring-1 ring-success/20 bg-success/5",
              )}
            >
              <div className="h-10 w-full rounded-lg bg-muted/50 flex items-end justify-center pb-1">
                <svg viewBox="0 0 40 20" className="h-4 w-8">
                  <path
                    d={i === 0 ? "M0 18 Q10 -5 20 10 Q30 25 40 2" :
                       i === 1 ? "M0 18 Q15 -8 25 8 Q35 20 40 2" :
                       i === 2 ? "M0 18 Q20 2 40 2" :
                       "M0 18 L40 2"}
                    fill="none"
                    stroke={imageColors[i]}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Reihenfolge sortieren
// ---------------------------------------------------------------------------

function SortingDemo({ isPaused }: { isPaused: boolean }) {
  const step = useAutoLoop(5, 1200, isPaused);
  const sequences = [
    [3, 1, 2, 0],
    [1, 3, 2, 0],
    [1, 2, 3, 0],
    [0, 1, 2, 3],
    [3, 1, 2, 0],
  ];
  const order = sequences[step] ?? [3, 1, 2, 0];
  const items = ["Idee", "Storyboard", "Animation", "Polish"];
  const isDone = step === 3;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Bringe in die richtige Reihenfolge:</p>
      {order.map((idx, pos) => (
        <motion.div
          key={items[idx]}
          layout
          transition={OVERSHOOT}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
            isDone && idx === pos
              ? "border-success/40 bg-success/5"
              : "border-border/40 bg-background/60",
          )}
        >
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
            isDone && idx === pos ? "bg-success text-white" : "bg-muted text-muted-foreground",
          )}>
            {pos + 1}
          </span>
          <span className="font-medium">{items[idx]}</span>
          {isDone && idx === pos && <span className="ml-auto text-success"><CheckSvg className="h-2.5 w-2.5" /></span>}
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. Zeitdruck (Timer)
// ---------------------------------------------------------------------------

function TimerDemo({ isPaused }: { isPaused: boolean; hue: string }) {
  const step = useAutoLoop(8, 750, isPaused);
  const timeLeft = Math.max(10 - step * 1.5, 0);
  const progress = timeLeft / 10;
  const isUrgent = timeLeft <= 4;
  const isCritical = timeLeft <= 2;
  const answered = step >= 6;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Schnell antworten!</p>
        <motion.span
          animate={isCritical && !answered ? {
            scale: [1, 1.15, 1],
            rotate: [0, -2, 2, 0],
          } : isUrgent && !answered ? {
            scale: [1, 1.08, 1],
          } : {}}
          transition={{ duration: isCritical ? 0.3 : 0.5, repeat: Infinity }}
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            isCritical && !answered ? "text-destructive" :
            isUrgent && !answered ? "text-chart-3" :
            "text-muted-foreground",
          )}
        >
          {answered ? <CheckSvg className="h-3.5 w-3.5" /> : `${timeLeft.toFixed(1)}s`}
        </motion.span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          animate={{ scaleX: progress }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn(
            "h-full origin-left rounded-full transition-colors",
            isCritical ? "bg-destructive" : isUrgent ? "bg-chart-3" : "bg-primary",
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {["Timing", "Staging", "Appeal", "Arcs"].map((opt, i) => (
          <motion.div
            key={opt}
            animate={answered && i === 0 ? {
              scale: [1, 1.08, 1],
            } : {}}
            transition={OVERSHOOT}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium",
              answered && i === 0
                ? "border-success/40 bg-success/10 text-success-foreground"
                : "border-border/40",
            )}
          >
            {opt}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-muted-foreground/40">
      <circle cx="5" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

function CheckSvg({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 6.5L5 9l4.5-6" />
    </svg>
  );
}

function CrossSvg({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}

function SparkleSvg({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className}>
      <path d="M6 0L7.4 4.6L12 6L7.4 7.4L6 12L4.6 7.4L0 6L4.6 4.6Z" />
    </svg>
  );
}
