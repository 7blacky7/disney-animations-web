import { AnimatedLink } from "@/components/animated/AnimatedLink";

/**
 * Minimal Footer
 *
 * Clean, professional footer with essential links.
 * No unnecessary decoration — lets the content breathe.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {currentYear} Disney Animations. Erstellt mit GSAP, Framer Motion & Lottie.
        </p>
        <nav className="flex items-center gap-6" aria-label="Footer-Navigation">
          <AnimatedLink
            href="https://github.com/7blacky7/disney-animations-web"
            target="_blank"
            rel="noopener noreferrer"
            thickness="thin"
            className="text-sm text-muted-foreground"
          >
            GitHub
          </AnimatedLink>
          <span className="text-sm text-muted-foreground/50 cursor-default" title="Folgt in Kuerze">
            Impressum
          </span>
        </nav>
      </div>
    </footer>
  );
}
