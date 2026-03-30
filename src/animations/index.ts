/**
 * Animation System — Central Barrel Export
 *
 * Import all animation utilities, variants, and GSAP presets from here.
 *
 * @example
 * ```tsx
 * import { fadeIn, slideUp, SPRING, createDisneyTransition } from "@/animations";
 * ```
 */

// Framer Motion Variants
export {
  // Basic Motion
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleOut,
  // Stagger
  staggerContainer,
  staggerItem,
  gridStaggerContainer,
  gridStaggerItem,
  // Disney Principles
  anticipation,
  squashAndStretch,
  followThrough,
  slowInSlowOut,
  arcs,
  secondaryAction,
  exaggeration,
  staging,
  // Composite
  heroEntrance,
  cardHover,
  textRevealContainer,
  textRevealItem,
  // Page Transitions
  pageEnter,
  pageScale,
  // Interactive
  buttonPress,
  floatingElement,
  magneticHover,
  // Notifications
  toastEnter,
  // Modal
  modalBackdrop,
  modalContent,
} from "./variants";

// Quiz Micro-Animation Variants (Duolingo/Kahoot-Level)
export {
  // Ambient "alive" effects
  wobble,
  pulse,
  float,
  shimmer,
  bounceIdle,
  // Quiz card interactions
  quizCard,
  quizOption,
  correctAnswer,
  wrongAnswer,
  // Quiz-type specific
  mcOptionStagger,
  mcOptionItem,
  dragElement,
  matchingLine,
  sliderThumb,
  trueFalseToggle,
  fillBlankReveal,
  imageChoice,
  sortingItem,
  timerUrgent,
  // Orchestration
  quizDemoContainer,
  scoreCounter,
  progressFill,
  // Quiz springs
  QUIZ_SPRING,
} from "./variants/quiz";

// Bento Grid Animation Variants (scroll-triggered staggered reveals)
export {
  // Containers
  bentoContainer,
  bentoContainerSlow,
  // Standard card entrances
  bentoItem,
  bentoItemLeft,
  bentoItemRight,
  // Hero card entrances (dramatic)
  bentoHero,
  bentoHero3D,
  // 3D perspective effects
  perspectiveTilt,
  perspectiveTiltLeft,
  perspectiveTiltRight,
  // Hover effects
  bentoHoverLift,
  bentoHover3D,
  // Utilities
  BENTO_SCROLL_CONFIG,
  getBentoEntrance,
} from "./variants/bento";

// Gameplay Animation Variants (Quiz-Spielmodus)
export {
  // Countdown
  countdownNumber,
  countdownRing,
  countdownPulse,
  // Score / Points
  scorePop,
  pointsFloat,
  comboMultiplier,
  // Streak
  streakFire,
  streakBadge,
  // Konfetti / Celebration
  confettiParticle,
  celebrationBurst,
  celebrationStar,
  // Leaderboard
  leaderboardContainer,
  leaderboardRow,
  leaderboardShift,
  podiumReveal,
  // Question Transitions
  questionEnter,
  answerOptionsContainer,
  answerOptionItem,
  // Results
  resultsReveal,
  resultsPercentage,
  resultsStat,
} from "./variants/gameplay";

// SVG Animation Variants (motion.path, pathLength, draw effects)
export {
  // Path draw effects
  pathDraw,
  pathDrawLoop,
  checkmarkContainer,
  checkmarkStroke,
  // Circle/shape effects
  circleGrow,
  circlePulse,
  circleRing,
  // Stroke dash
  dashMarch,
  // SVG element motion
  svgBounceIn,
  svgRotateLoop,
  svgWiggle,
  svgFloatY,
  // Multi-path stagger
  svgStaggerContainer,
  svgStaggerPath,
  // Quiz-specific SVG
  handGrab,
  cursorBlink,
  scaleToggle,
  timerHand,
  sortArrowUp,
  sortArrowDown,
  imageFrame,
} from "./variants/svg";

// GSAP Presets
export {
  heroEntrance as gsapHeroEntrance,
  scrollReveal,
  parallaxLayer,
  horizontalScroll,
  pinnedSection,
  scrollTriggerDefaults,
} from "./gsap/presets";

// GSAP Config
export {
  registerGSAPPlugins,
  refreshScrollTrigger,
  killAllScrollTriggers,
  createBatchScrollTrigger,
  SCROLL_TRIGGER_DEFAULTS,
  PIN_DEFAULTS,
} from "./gsap/scrolltrigger-config";

// Animation Utilities
export {
  TIMING,
  EASING,
  SPRING,
  STAGGER,
  GSAP_EASE,
  createDisneyTransition,
  getReducedMotionVariant,
  prefersReducedMotion,
} from "@/lib/animation-utils";

export type {
  TimingKey,
  EasingKey,
  SpringKey,
  GsapEaseKey,
} from "@/lib/animation-utils";
