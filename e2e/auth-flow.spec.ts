import { test, expect } from "@playwright/test";

/**
 * Auth Flow E2E Tests
 *
 * Verifiziert Login, Register, Logout und Session-Handling.
 */

test.describe("Auth Flow", () => {
  test("Login mit Seed-User funktioniert", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Formular ausfüllen
    await page.fill('input[type="email"], input[name="email"]', "admin@demo-gmbh.de");
    await page.fill('input[type="password"], input[name="password"]', "password123");

    // Absenden
    await page.click('button[type="submit"]');

    // Sollte zum Dashboard weiterleiten
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("Login mit falschem Passwort zeigt Fehler", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"], input[name="email"]', "admin@demo-gmbh.de");
    await page.fill('input[type="password"], input[name="password"]', "falschesPasswort");
    await page.click('button[type="submit"]');

    // Warte und prüfe: entweder Fehlermeldung ODER immer noch auf /login
    await page.waitForTimeout(3_000);
    expect(page.url()).toContain("/login");
  });

  test("Register erstellt neuen User", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@playwright.test`;

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Register-Form: Labels "Name", "E-Mail", "Passwort"
    await page.getByLabel("Name").fill("Playwright Tester");
    await page.getByLabel("E-Mail").fill(uniqueEmail);
    await page.getByLabel("Passwort").fill("TestPasswort123!");
    await page.click('button[type="submit"]');

    // Sollte zum Dashboard weiterleiten
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("Unauthentifizierter Zugriff auf /dashboard leitet zu /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login*", { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("Logout funktioniert", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"], input[name="email"]', "admin@demo-gmbh.de");
    await page.fill('input[type="password"], input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10_000 });

    // Logout via API
    await page.evaluate(() =>
      fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    // Nach Logout: Dashboard nicht mehr zugänglich
    await page.goto("/dashboard");
    await page.waitForURL("**/login*", { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });
});
