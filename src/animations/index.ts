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
