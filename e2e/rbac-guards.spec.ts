import { test, expect } from "@playwright/test";

/**
 * RBAC Guards E2E Tests
 *
 * Verifiziert rollenbasierte Zugriffskontrolle für alle Dashboard-Seiten.
 */

// Helper: Login via Formular
async function loginAs(page: import("@playwright/test").Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}

test.describe("RBAC Guards — Admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@demo-gmbh.de");
  });

  test("Admin kann Dashboard sehen", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 5_000 });
  });

  test("Admin kann /quizzes sehen", async ({ page }) => {
    await page.goto("/quizzes");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Quizzes" })).toBeVisible({ timeout: 5_000 });
  });

  test("Admin kann /users sehen", async ({ page }) => {
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Benutzer" })).toBeVisible({ timeout: 5_000 });
  });

  test("Admin kann /settings sehen", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible({ timeout: 5_000 });
  });

  test("Admin wird von /tenants zu /dashboard redirected", async ({ page }) => {
    await page.goto("/tenants");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });
});

test.describe("RBAC Guards — User", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "max@demo-gmbh.de");
  });

  test("User kann Dashboard sehen", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 5_000 });
  });

  test("User wird von /users zu /dashboard redirected", async ({ page }) => {
    await page.goto("/users");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });

  test("User wird von /settings zu /dashboard redirected", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });

  test("User wird von /departments zu /dashboard redirected", async ({ page }) => {
    await page.goto("/departments");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });

  test("User wird von /quizzes zu /dashboard redirected", async ({ page }) => {
    await page.goto("/quizzes");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });

  test("User wird von /tenants zu /dashboard redirected", async ({ page }) => {
    await page.goto("/tenants");
    await page.waitForURL("**/dashboard", { timeout: 5_000 });
  });
});

test.describe("RBAC Guards — Öffentliche Routen", () => {
  test("/play ist ohne Login zugänglich", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Quizzes & Lernpfade" })).toBeVisible({ timeout: 5_000 });
  });

  test("/login ist ohne Login zugänglich", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Willkommen")).toBeVisible({ timeout: 5_000 });
  });

  test("Landing Page ist ohne Login zugänglich", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 5_000 });
  });
});
