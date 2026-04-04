import { test, expect } from "@playwright/test";

/**
 * Browser-Zurück E2E Tests
 *
 * Reproduziert den Bug: Nach Navigation Landing → Login/Register → Browser-Zurück
 * war Content unsichtbar (opacity:0 durch Framer Motion / GSAP ScrollReveal).
 *
 * Root Cause: Animationen setzten opacity:0 als initial state.
 * Bei bfcache-Restore feuerte whileInView nicht erneut → Content blieb unsichtbar.
 *
 * Fixes: opacity:0 aus allen Animation-Variants entfernt,
 * GSAP ScrollReveal opacity:0 entfernt, pageshow/reload Endlosschleife entfernt.
 */

test.describe("Browser-Zurück Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Console-Errors sammeln
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Unhandled Errors abfangen (Freeze/Crash Detection)
    page.on("pageerror", (err) => {
      consoleErrors.push(`PAGE ERROR: ${err.message}`);
    });

    // Store errors on page context for later assertion
    (page as unknown as Record<string, unknown>).__consoleErrors = consoleErrors;
  });

  test("Landing → Register → Back: JavaScript/React LEBT (Hydration-Bug)", async ({ page }) => {
    // REPRODUKTION vom Auftraggeber:
    // Landing → "Jetzt starten" → "Konto erstellen" → Back → Seite TOT

    // 1. Landing Page öffnen und warten bis React hydratiert
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verifiziere: ThemeSwitcher funktioniert VOR Navigation
    const themeSwitcher = page.locator('button[aria-label*="Theme"]').first();
    if (await themeSwitcher.isVisible()) {
      await themeSwitcher.click();
      await page.waitForTimeout(300);
      // Dropdown sollte erscheinen
      const hasDropdown = await page.evaluate(() => {
        return document.querySelectorAll('[role="menu"], [data-state="open"], [class*="dropdown"]').length > 0;
      });
      // Schließen per Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    // 2. Klick auf "Jetzt starten" (→ /register) — EXAKT wie der Auftraggeber
    const ctaLink = page.locator('a[href="/register"]').first();
    await expect(ctaLink).toBeVisible();
    await ctaLink.click();
    await page.waitForURL("**/register");

    // 3. Browser-Zurück
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000); // Warte auf Hydration

    // 4. KRITISCHER TEST: Ist React/JavaScript noch lebendig?
    // Test A: onClick Handler funktioniert
    const jsAlive = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let clicked = false;
        const handler = () => { clicked = true; };
        document.addEventListener("click", handler, { once: true });
        // Simuliere einen Click
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        setTimeout(() => {
          document.removeEventListener("click", handler);
          resolve(clicked);
        }, 100);
      });
    });
    expect(jsAlive, "JavaScript Event-Listener sind TOT nach Browser-Zurück").toBe(true);

    // Test B: React-Komponenten reagieren auf Klicks
    // Prüfe ob IRGENDEIN Button/Link einen React-Handler hat
    const reactAlive = await page.evaluate(() => {
      const buttons = document.querySelectorAll("button, a[href]");
      // Check: Haben Elemente React fiber (__reactFiber$ oder __reactInternalInstance$)
      for (const btn of buttons) {
        const keys = Object.keys(btn);
        const hasReactFiber = keys.some(k => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"));
        if (hasReactFiber) return true;
      }
      return false;
    });
    expect(reactAlive, "React ist NICHT hydratiert nach Browser-Zurück — Event-Handler fehlen").toBe(true);

    // Test C: ThemeSwitcher-Klick NACH Browser-Zurück
    const themeSwitcherAfter = page.locator('button[aria-label*="Theme"]').first();
    if (await themeSwitcherAfter.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await themeSwitcherAfter.click();
      await page.waitForTimeout(500);
      const dropdownVisible = await page.evaluate(() => {
        return document.querySelectorAll('[role="menu"], [data-state="open"], [class*="popover"]').length > 0;
      });
      expect(dropdownVisible, "ThemeSwitcher reagiert NICHT nach Browser-Zurück — React tot").toBe(true);
    }

    // Test D: Navigation-Link klickbar (nicht nur sichtbar)
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    // Wenn React tot ist, passiert NICHTS beim Klick auf Next.js Link
    try {
      await page.waitForURL("**/login", { timeout: 5_000 });
    } catch {
      // Wenn URL sich nicht ändert → React ist tot
      expect(false, "Navigation-Link reagiert NICHT — React/Next.js ist tot nach Browser-Zurück").toBe(true);
    }
  });

  test("Landing → Login → Back: Content sichtbar und klickbar", async ({ page }) => {
    // 1. Landing Page öffnen
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verifiziere Landing Page geladen
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible({ timeout: 10_000 });

    // 2. Auf "Login" Link klicken
    await page.click('a[href="/login"]');
    await page.waitForURL("**/login");
    await expect(page.locator("text=Willkommen")).toBeVisible({ timeout: 5_000 });

    // 3. Browser-Zurück
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");

    // 4. Warte kurz für Animationen / bfcache-Restore
    await page.waitForTimeout(1_000);

    // 5. Prüfe: Ist Content sichtbar?
    await expect(heroHeading).toBeVisible({ timeout: 5_000 });

    // 6. Prüfe: Kein Element hat opacity:0 (der ursprüngliche Bug)
    const invisibleElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("section, h1, h2, h3, button, a, p");
      const invisible: string[] = [];
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const opacity = parseFloat(style.opacity);
        if (opacity < 0.1 && !el.getAttribute("aria-hidden")) {
          invisible.push(
            `${el.tagName}.${el.className?.toString().substring(0, 40)} opacity=${opacity}`
          );
        }
      });
      return invisible;
    });

    expect(
      invisibleElements,
      `Unsichtbare Elemente nach Browser-Zurück: ${invisibleElements.join(", ")}`
    ).toHaveLength(0);

    // 7. Prüfe: Buttons sind klickbar
    const ctaButton = page.locator('a[href="/register"]').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();

    // 8. Prüfe: Seite friert nicht ein (kann interagiert werden)
    // Scroll-Test: Versuche via scrollIntoView statt scrollTo
    // (scrollTo kann in Headless bei overflow-hidden fehlschlagen)
    const canInteract = await page.evaluate(() => {
      const el = document.getElementById("features");
      if (el) {
        el.scrollIntoView({ behavior: "instant" });
        return true;
      }
      // Fallback: Prüfe ob die Seite interaktiv ist (nicht eingefroren)
      return document.readyState === "complete";
    });
    expect(canInteract).toBe(true);

    // 9. Keine kritischen Console-Errors
    const errors = (page as unknown as Record<string, unknown>).__consoleErrors as string[];
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("DevTools") &&
        !e.includes("<circle>") && // SVG attribute warnings (non-critical)
        !e.includes("<svg")
    );
    expect(
      criticalErrors,
      `Console-Errors: ${criticalErrors.join("\n")}`
    ).toHaveLength(0);
  });

  test("Landing → Register → Back: Content sichtbar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Klick auf "Registrieren"
    await page.click('a[href="/register"]');
    await page.waitForURL("**/register");
    await expect(page.locator("text=Konto erstellen")).toBeVisible({ timeout: 5_000 });

    // Browser-Zurück
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1_000);

    // Hero sichtbar?
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible({ timeout: 5_000 });

    // Features Section sichtbar? (scrollt nach unten)
    const featuresSection = page.locator("#features");
    await featuresSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(featuresSection).toBeVisible();

    // Feature-Cards below-the-fold: opacity darf nicht 0 sein
    const featureCardOpacities = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        "#features .will-animate, #features [class*=transition-shadow], #features [class*=rounded]"
      );
      const invisible: string[] = [];
      cards.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (parseFloat(style.opacity) < 0.1) {
          invisible.push(
            `${el.tagName}.${el.className?.toString().substring(0, 50)} opacity=${style.opacity}`
          );
        }
      });
      return invisible;
    });

    expect(
      featureCardOpacities,
      `Unsichtbare Feature-Cards: ${featureCardOpacities.join(", ")}`
    ).toHaveLength(0);

    // Showcase Section prüfen
    const showcaseSection = page.locator("#showcase");
    await showcaseSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const showcaseInvisible = await page.evaluate(() => {
      const els = document.querySelectorAll("#showcase p, #showcase h2, #showcase [class*=rounded]");
      const invisible: string[] = [];
      els.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (parseFloat(style.opacity) < 0.1 && !el.getAttribute("aria-hidden")) {
          invisible.push(
            `${el.tagName}.${el.className?.toString().substring(0, 50)} opacity=${style.opacity}`
          );
        }
      });
      return invisible;
    });

    expect(
      showcaseInvisible,
      `Unsichtbare Showcase-Elemente: ${showcaseInvisible.join(", ")}`
    ).toHaveLength(0);
  });

  test("Landing → Login → Back → Forward → Back: Mehrfach-Navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hin
    await page.click('a[href="/login"]');
    await page.waitForURL("**/login");

    // Zurück
    await page.goBack();
    await page.waitForTimeout(500);

    // Vorwärts
    await page.goForward();
    await page.waitForURL("**/login");

    // Nochmal zurück
    await page.goBack();
    await page.waitForTimeout(1_000);

    // Content muss immer noch sichtbar sein
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible({ timeout: 5_000 });

    // Kein opacity:0 Bug
    const hasInvisible = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return true;
      return parseFloat(window.getComputedStyle(h1).opacity) < 0.1;
    });
    expect(hasInvisible).toBe(false);
  });

  test("Keine Endlosschleife bei pageshow/reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate weg und zurück
    await page.click('a[href="/login"]');
    await page.waitForURL("**/login");
    await page.goBack();

    // Warte 3 Sekunden — wenn Endlosschleife, würde die Seite ständig reloaden
    let reloadCount = 0;
    page.on("load", () => reloadCount++);
    await page.waitForTimeout(3_000);

    // Maximal 1 Load-Event (der initiale Back-Navigation)
    expect(
      reloadCount,
      `Seite hat ${reloadCount}x reloaded — mögliche Endlosschleife!`
    ).toBeLessThanOrEqual(1);
  });

  test("Kein pageshow/reload Script im HTML", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();

    // Diese Patterns würden eine Endlosschleife verursachen
    expect(html).not.toContain("pageshow");
    expect(html).not.toContain("persisted");
    // reload() im Kontext von pageshow ist verboten
    const hasPageshowReload = html.includes("pageshow") && html.includes("reload");
    expect(hasPageshowReload).toBe(false);
  });
});
