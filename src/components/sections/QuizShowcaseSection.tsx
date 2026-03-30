"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { SPRING, TIMING, STAGGER } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * QuizShowcaseSection — Animated Quiz Preview (core section)
 *
 * Features:
 * - Horizontal scroll pinned section (GSAP)
 * - 4 quiz type demos: Multiple Choice, Drag&Drop, Matching, Slider
 * - Each demo auto-animates in a 6s loop
 * - Hover pauses auto-animation
 * - ScrollTrigger starts demo at 50% scroll
 *
 * Disney Principles:
 * - Staging: pinned view forces focus
 * - Timing: 6s loops feel natural
 * - Anticipation: elements prepare before action
 * - Follow-through: spring physics on interactions
 * - Secondary Action: subtle bg effects complement demos
 */

interface QuizDemo {
  id: string;
  title: string;
  description: string;
  color: string;
}

const quizDemos: QuizDemo[] = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Klassische Auswahlfragen mit animiertem Feedback",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    id: "drag-drop",
    title: "Drag & Drop",
    description: "Elemente sortieren mit Spring-Physik",
    color: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "matching",
    title: "Matching",
    description: "Paare verbinden mit animierten Linien",
    color: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    id: "slider",
    title: "Slider",
    description: "Wert schaetzen mit Thumb-Animation",
    color: "from-violet-500/10 to-violet-600/5",
  },
];

export function QuizShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAccessibility();

  // GSAP horizontal scroll pinning
  useEffect(() => {
    if (prefersReducedMotion) return;

    let ctx: gsap.Context | undefined;

    async function setup() {
      const el = scrollContainerRef.current;
      const trigger = sectionRef.current;
      if (!el || !trigger) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const scrollWidth = el.scrollWidth - el.clientWidth;

        gsap.to(el, {
          x: -scrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            pin: true,
            start: "top top",
            end: () => `+=${scrollWidth}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }, trigger);
    }

    setup();

    return () => {
      ctx?.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Section header — before pinned area */}
      <div className="px-6 pt-[var(--section-gap)] pb-12">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal direction="up" distance={24} className="text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              Interaktive Demos
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Quiz-Typen in Aktion
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Jeder Quiz-Typ nutzt unterschiedliche Animationsprinzipien.
              Scrolle horizontal um alle vier zu entdecken.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="h-[100dvh] overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex h-full items-center gap-8 px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          style={{ width: "fit-content" }}
        >
          {quizDemos.map((demo, i) => (
            <QuizDemoCard key={demo.id} demo={demo} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </section>
  );
}

/**
 * Individual Quiz Demo Card with auto-animation loop
 */
function QuizDemoCard({ demo, index }: { demo: QuizDemo; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { prefersReducedMotion } = useAccessibility();

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative flex h-[70vh] w-[min(85vw,480px)] shrink-0 flex-col",
        "overflow-hidden rounded-2xl",
        "border border-border/50",
        "bg-gradient-to-br",
        demo.color,
        "backdrop-blur-sm",
      )}
    >
      {/* Card header */}
      <div className="p-6 pb-0">
        <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Typ {index + 1}
        </span>
        <h3 className="mt-3 font-heading text-xl font-semibold">{demo.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{demo.description}</p>
      </div>

      {/* Demo area */}
      <div className="flex flex-1 items-center justify-center p-6">
        {demo.id === "multiple-choice" && (
          <MultipleChoiceDemo isPaused={isHovered || prefersReducedMotion} />
        )}
        {demo.id === "drag-drop" && (
          <DragDropDemo isPaused={isHovered || prefersReducedMotion} />
        )}
        {demo.id === "matching" && (
          <MatchingDemo isPaused={isHovered || prefersReducedMotion} />
        )}
        {demo.id === "slider" && (
          <SliderDemo isPaused={isHovered || prefersReducedMotion} />
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Quiz Demo Components (auto-animated 6s loops)
// ---------------------------------------------------------------------------

/**
 * Multiple Choice Demo — Options highlight sequentially
 */
function MultipleChoiceDemo({ isPaused }: { isPaused: boolean }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const CYCLE = 6000;
    const SELECT_DELAY = 1000;
    const options = [0, 1, 2, 3];
    const correctAnswer = 2;
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    function next() {
      if (step < options.length) {
        setActiveIndex(options[step]);
        setShowCheck(false);
        step++;
        timer = setTimeout(next, SELECT_DELAY);
      } else {
        // Show correct answer
        setActiveIndex(correctAnswer);
        setShowCheck(true);
        timer = setTimeout(() => {
          // Reset
          step = 0;
          setActiveIndex(-1);
          setShowCheck(false);
          timer = setTimeout(next, 500);
        }, 2000);
      }
    }

    timer = setTimeout(next, 500);
    return () => clearTimeout(timer);
  }, [isPaused]);

  const options = ["Squash & Stretch", "Staging", "Anticipation", "Follow Through"];

  return (
    <div className="flex w-full flex-col gap-2.5">
      <p className="mb-2 text-sm font-medium">Welches Prinzip kommt vor der Aktion?</p>
      {options.map((opt, i) => (
        <motion.div
          key={opt}
          animate={{
            scale: activeIndex === i ? 1.02 : 1,
            borderColor:
              activeIndex === i
                ? showCheck && i === 2
                  ? "var(--color-chart-1)"
                  : "var(--primary)"
                : "var(--border)",
          }}
          transition={{ ...SPRING.snappy }}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-2.5",
            "text-sm transition-colors",
            activeIndex === i && "bg-primary/5",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
              activeIndex === i
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30",
            )}
          >
            {showCheck && activeIndex === i && i === 2 ? (
              <CheckIcon />
            ) : (
              String.fromCharCode(65 + i)
            )}
          </span>
          {opt}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Drag & Drop Demo — Items reorder with spring physics
 */
function DragDropDemo({ isPaused }: { isPaused: boolean }) {
  const [order, setOrder] = useState([0, 1, 2, 3]);

  useEffect(() => {
    if (isPaused) return;

    const CYCLE = 6000;
    const sequences = [
      [1, 0, 2, 3],
      [1, 2, 0, 3],
      [1, 2, 3, 0],
      [0, 1, 2, 3],
    ];
    let step = 0;
    let timer: ReturnType<typeof setInterval>;

    timer = setInterval(() => {
      setOrder(sequences[step % sequences.length]);
      step++;
    }, CYCLE / sequences.length);

    return () => clearInterval(timer);
  }, [isPaused]);

  const items = ["Timing", "Spacing", "Staging", "Appeal"];

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="mb-2 text-sm font-medium">Sortiere nach Wichtigkeit:</p>
      {order.map((itemIndex, position) => (
        <motion.div
          key={items[itemIndex]}
          layout
          transition={{ ...SPRING.bouncy }}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-2.5",
            "text-sm backdrop-blur-sm",
          )}
        >
          <span className="text-xs text-muted-foreground">{position + 1}.</span>
          <GripIcon />
          {items[itemIndex]}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Matching Demo — Lines connect pairs
 */
function MatchingDemo({ isPaused }: { isPaused: boolean }) {
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    if (isPaused) return;

    const pairs = [0, 1, 2];
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    function next() {
      if (step < pairs.length) {
        setMatched((prev) => [...prev, pairs[step]]);
        step++;
        timer = setTimeout(next, 1500);
      } else {
        timer = setTimeout(() => {
          setMatched([]);
          step = 0;
          timer = setTimeout(next, 800);
        }, 1500);
      }
    }

    timer = setTimeout(next, 600);
    return () => clearTimeout(timer);
  }, [isPaused]);

  const left = ["Bounce", "Elastic", "Power2"];
  const right = ["Spring", "Snap", "Smooth"];

  return (
    <div className="flex w-full items-start justify-between gap-6">
      <div className="flex flex-col gap-3">
        {left.map((item, i) => (
          <motion.div
            key={item}
            animate={{
              scale: matched.includes(i) ? 1.05 : 1,
              borderColor: matched.includes(i) ? "var(--primary)" : "var(--border)",
            }}
            transition={{ ...SPRING.snappy }}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {item}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {right.map((item, i) => (
          <motion.div
            key={item}
            animate={{
              scale: matched.includes(i) ? 1.05 : 1,
              borderColor: matched.includes(i) ? "var(--primary)" : "var(--border)",
            }}
            transition={{ ...SPRING.snappy }}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Slider Demo — Thumb slides to value
 */
function SliderDemo({ isPaused }: { isPaused: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const targets = [30, 65, 85, 42, 0];
    let step = 0;
    let timer: ReturnType<typeof setInterval>;

    timer = setInterval(() => {
      setValue(targets[step % targets.length]);
      step++;
    }, 1200);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm font-medium">Wie sicher bist du? {value}%</p>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          animate={{ width: `${value}%` }}
          transition={{ ...SPRING.bouncy }}
        />
      </div>
      <div className="relative h-5 w-full">
        <motion.div
          className="absolute top-0 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-primary shadow-md"
          animate={{ left: `${value}%` }}
          transition={{ ...SPRING.bouncy }}
        >
          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small Icon Components
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-muted-foreground/50">
      <circle cx="5" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}
