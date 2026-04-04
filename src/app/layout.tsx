import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/providers/AccessibilityProvider";
import { DebugProvider } from "@/providers/DebugProvider";
import { GSAPProvider } from "@/providers/GSAPProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

/**
 * Typography System:
 * - Syne: Bold geometric display font for headings — distinctive, cinematic
 * - Plus Jakarta Sans: Warm, readable body font — elegant alternative to Geist
 * - JetBrains Mono: Code blocks and technical text
 */
const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Disney Animations — Zeitlose Prinzipien, moderne Technik",
  description:
    "Interaktive Showcase-Website: Disney's 12 Animationsprinzipien, umgesetzt mit GSAP, Framer Motion und Lottie. Enterprise-Level Design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${syne.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent FOUC: apply theme class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("disney-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}var a=localStorage.getItem("disney-accent")||"amber";document.documentElement.setAttribute("data-accent",a)}catch(e){document.documentElement.setAttribute("data-accent","amber")}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AccessibilityProvider>
            <DebugProvider>
              <GSAPProvider>{children}</GSAPProvider>
            </DebugProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
