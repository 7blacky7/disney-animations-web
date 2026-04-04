import { test, expect } from "@playwright/test";

/**
 * Quiz-Player E2E Tests
 *
 * Verifiziert den kompletten Quiz-Durchlauf:
 * Start → Fragen beantworten → Ergebnis.
 */

async function loginAs(page: import("@playwright/test").Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}

test.describe("Quiz Discovery", () => {
  test("/play zeigt verfügbare Quizzes", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    // Mindestens 1 Quiz sichtbar
    const quizCards = page.locator('a[href*="/play/"]');
    const count = await quizCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Quiz-Karte hat Spielen-Button", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    const playButtons = page.locator("text=Spielen");
    const count = await playButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Quiz Player", () => {
  test("Quiz Start-Screen zeigt Titel und Fragezahl", async ({ page }) => {
    // Öffne /play und navigiere zum ersten Quiz
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    const playLink = page.locator('a[href*="/play/"]').first();
    const href = await playLink.getAttribute("href");
    expect(href).toBeTruthy();

    // Direkt zum Quiz navigieren
    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    // Start-Screen: Quiz-Titel + "Quiz starten" oder "keine Fragen"
    const startButton = page.locator("text=Quiz starten");
    const noQuestions = page.locator("text=keine Fragen");

    const hasStart = await startButton.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasEmpty = await noQuestions.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasStart || hasEmpty, "Weder Start-Button noch Leeres-Quiz Meldung").toBe(true);
  });

  test("Leeres Quiz zeigt Zurück-Link", async ({ page }) => {
    await loginAs(page, "max@demo-gmbh.de");

    // QA Publish Final Test hat 0 Fragen
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Suche Quiz mit 0 Fragen via Dashboard
    const emptyQuizLink = page.locator('a[href*="/play/"]').first();
    if (await emptyQuizLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emptyQuizLink.click();
      await page.waitForLoadState("networkidle");

      const noQuestions = page.locator("text=keine Fragen");
      if (await noQuestions.isVisible({ timeout: 5_000 }).catch(() => false)) {
        // Zurück-Link vorhanden
        const backLink = page.locator("text=Dashboard, text=Startseite, text=Zurück").first();
        const hasBack = await backLink.isVisible({ timeout: 2_000 }).catch(() => false);
        // Wenn leeres Quiz gefunden, muss Zurück-Link da sein
        if (await noQuestions.isVisible()) {
          expect(hasBack).toBe(true);
        }
      }
    }
  });

  test("Security: codeSolution nicht im Client-HTML", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    // Öffne erstes Quiz
    const playLink = page.locator('a[href*="/play/"]').first();
    if (await playLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await playLink.click();
      await page.waitForLoadState("networkidle");

      const html = await page.content();
      expect(html).not.toContain("codeSolution");
      expect(html).not.toContain("correctAnswer");
      expect(html).not.toContain("password_hash");
    }
  });

  test("Security: Unpublished Quiz gibt 404", async ({ page }) => {
    const response = await page.goto("/play/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });
});
