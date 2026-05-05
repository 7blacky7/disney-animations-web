"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { updateTenantBranding } from "@/lib/actions/user";
import { updateTenantLandingSettings, updateTenantAiSettings, uploadTenantLogo, deleteTenantLogo } from "@/lib/actions/tenant";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Settings Client — Phase 9: Branding-Editor, Mail-Config, General Settings
 * Connected to updateTenantBranding Server Action.
 */

interface Tenant {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  showLogoOnLanding?: boolean;
  quizAttribution?: "named" | "anonymous";
  aiEnabled?: boolean;
  aiProvider?: "claude_cli" | "claude_api" | "openai" | null;
  aiModel?: string | null;
}

interface SettingsClientProps {
  tenant: Tenant | null;
}

const ACCENT_PRESETS = [
  { id: "indigo", label: "Indigo", color: "oklch(0.55 0.20 270)" },
  { id: "emerald", label: "Smaragd", color: "oklch(0.55 0.17 160)" },
  { id: "rose", label: "Rose", color: "oklch(0.55 0.20 350)" },
  { id: "amber", label: "Amber", color: "oklch(0.65 0.18 75)" },
  { id: "violet", label: "Violett", color: "oklch(0.55 0.22 300)" },
  { id: "custom", label: "Eigene", color: "" },
];

export function SettingsClient({ tenant }: SettingsClientProps) {
  const { prefersReducedMotion } = useAccessibility();
  const [tenantName, setTenantName] = useState(tenant?.name ?? "");
  const [selectedAccent, setSelectedAccent] = useState("indigo");
  const [customColor, setCustomColor] = useState(tenant?.accentColor ?? "#4F46E5");
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [mailProvider, setMailProvider] = useState<"graph" | "smtp">("smtp");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      await uploadTenantLogo(fd);
      setLogoUrl(`/api/tenants/${tenant?.id}/logo?v=${Date.now()}`);
      setFeedback({ kind: "success", msg: "Logo aktualisiert." });
    } catch (err) {
      setFeedback({ kind: "error", msg: err instanceof Error ? err.message : "Upload fehlgeschlagen" });
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoDelete() {
    setFeedback(null);
    setLogoUploading(true);
    try {
      await deleteTenantLogo();
      setLogoUrl(null);
      setFeedback({ kind: "success", msg: "Logo entfernt." });
    } catch (err) {
      setFeedback({ kind: "error", msg: err instanceof Error ? err.message : "Löschen fehlgeschlagen" });
    } finally {
      setLogoUploading(false);
    }
  }

  function reportError(err: unknown, fallback: string) {
    setFeedback({ kind: "error", msg: err instanceof Error ? err.message : fallback });
  }

  function handleSaveBranding() {
    startTransition(async () => {
      try {
        const accentColor = selectedAccent === "custom"
          ? customColor
          : ACCENT_PRESETS.find((p) => p.id === selectedAccent)?.color ?? undefined;

        await updateTenantBranding({
          name: tenantName || undefined,
          primaryColor: accentColor,
          accentColor,
        });
      } catch {
        // Handle error
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firmen-Branding, Mail-Konfiguration und allgemeine Einstellungen.
        </p>
      </div>

      {!tenant && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Melde dich an, um Einstellungen zu verwalten.
          </p>
        </div>
      )}

      {feedback && (
        <div
          role="alert"
          className={
            "rounded-md border px-3 py-2 text-sm " +
            (feedback.kind === "success"
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive")
          }
        >
          {feedback.msg}
        </div>
      )}

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="ai">KI-Assistent</TabsTrigger>
          <TabsTrigger value="mail">Mail</TabsTrigger>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
        </TabsList>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Firmen-Identitaet</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Firmenname</Label>
                <Input id="tenant-name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Ihre Firma" />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground text-xs">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      "Logo"
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={logoUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoUploading ? "Lädt…" : logoUrl ? "Ändern" : "Hochladen"}
                  </Button>
                  {logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      disabled={logoUploading}
                      onClick={handleLogoDelete}
                      className="text-destructive hover:text-destructive"
                    >
                      Entfernen
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPEG oder WebP, max 500 KB.</p>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Akzentfarbe</h2>
            <p className="text-sm text-muted-foreground">Waehle eine Farbe die in der gesamten Plattform als Akzent verwendet wird.</p>
            <div className="flex flex-wrap gap-3">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedAccent(preset.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-150",
                    selectedAccent === preset.id ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "border-border/40 hover:border-border",
                  )}
                >
                  {preset.id === "custom" ? (
                    <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30" style={customColor ? { backgroundColor: customColor, borderStyle: "solid", borderColor: customColor } : undefined} />
                  ) : (
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: preset.color }} />
                  )}
                  <span className="text-[10px] font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
            {selectedAccent === "custom" && (
              <motion.div layout={!prefersReducedMotion} initial={prefersReducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }} className="space-y-2 overflow-hidden">
                <Label htmlFor="custom-color">Eigene Farbe (HEX)</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border border-border/40" />
                  <Input id="custom-color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#4F46E5" className="max-w-[140px] font-mono text-sm" />
                </div>
              </motion.div>
            )}
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Vorschau</h2>
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-heading text-sm font-bold text-primary">{(tenantName || "F").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold">{tenantName || "Firmenname"}</p>
                  <p className="text-xs text-muted-foreground">Quiz Platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                <AnimatedButton size="sm" shine>Primaer-Button</AnimatedButton>
                <Button variant="outline" size="sm">Sekundaer</Button>
              </div>
            </div>
          </section>

          <AnimatedButton shine intensity="bold" onClick={handleSaveBranding} disabled={isPending}>
            {isPending ? "Wird gespeichert..." : "Branding speichern"}
          </AnimatedButton>
        </TabsContent>

        {/* LANDING PAGE TAB */}
        <TabsContent value="landing" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Logo auf Landing Page</h2>
            <p className="text-sm text-muted-foreground">
              Wenn aktiviert, wird das Firmenlogo auf der oeffentlichen Startseite angezeigt.
            </p>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium">Logo anzeigen</p>
                <p className="text-xs text-muted-foreground">Opt-in: Firmenlogo auf der Landing Page sichtbar machen.</p>
              </div>
              <Switch
                checked={tenant?.showLogoOnLanding ?? false}
                onCheckedChange={(checked) => {
                  setFeedback(null);
                  startTransition(async () => {
                    try {
                      await updateTenantLandingSettings({ showLogoOnLanding: checked });
                      setFeedback({ kind: "success", msg: "Einstellung gespeichert." });
                    } catch (err) {
                      reportError(err, "Aktualisierung fehlgeschlagen");
                    }
                  });
                }}
                disabled={isPending}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Quiz-Attribution</h2>
            <p className="text-sm text-muted-foreground">
              Bestimmt ob freigegebene Quizzes auf der Landing Page mit Firmennamen angezeigt werden.
            </p>
            <div className="flex gap-3">
              {([
                { value: "named" as const, label: "Mit Firmenname", desc: "\"Erstellt von [Firmenname]\" wird angezeigt" },
                { value: "anonymous" as const, label: "Anonymisiert", desc: "Quiz ohne Firmenzuordnung angezeigt" },
              ]).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFeedback(null);
                    startTransition(async () => {
                      try {
                        await updateTenantLandingSettings({ quizAttribution: option.value });
                        setFeedback({ kind: "success", msg: "Quiz-Attribution gespeichert." });
                      } catch (err) {
                        reportError(err, "Aktualisierung fehlgeschlagen");
                      }
                    });
                  }}
                  disabled={isPending}
                  className={cn(
                    "flex-1 rounded-xl border p-4 text-left transition-all",
                    (tenant?.quizAttribution ?? "anonymous") === option.value
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/40 hover:border-border",
                  )}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* KI-ASSISTENT TAB */}
        <TabsContent value="ai" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">KI-Lernassistent</h2>
            <p className="text-sm text-muted-foreground">
              Aktiviere einen KI-Assistenten der Lernende beim Programmieren unterstuetzt.
              Der Assistent gibt Hinweise, erklaert Konzepte und hilft bei Fehlern.
            </p>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium">KI-Assistent aktivieren</p>
                <p className="text-xs text-muted-foreground">Opt-in: Lernende koennen den KI-Tutor waehrend Quizzes nutzen.</p>
              </div>
              <Switch
                checked={tenant?.aiEnabled ?? false}
                onCheckedChange={(checked) => {
                  setFeedback(null);
                  startTransition(async () => {
                    try {
                      await updateTenantAiSettings({ aiEnabled: checked });
                      setFeedback({ kind: "success", msg: "KI-Einstellung gespeichert." });
                    } catch (err) {
                      reportError(err, "Aktualisierung fehlgeschlagen");
                    }
                  });
                }}
                disabled={isPending}
              />
            </div>
          </section>

          {(tenant?.aiEnabled ?? false) && (
            <>
              <Separator />
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Provider</h2>
                <div className="flex gap-3">
                  {([
                    { value: "claude_cli" as const, label: "Claude CLI", desc: "Lokaler Dev/Test-Modus (kostenlos)" },
                    { value: "claude_api" as const, label: "Claude API", desc: "Anthropic API mit eigenem Key" },
                    { value: "openai" as const, label: "OpenAI", desc: "OpenAI API mit eigenem Key" },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            await updateTenantAiSettings({ aiProvider: option.value });
                          } catch {
                            // Handle error
                          }
                        });
                      }}
                      disabled={isPending}
                      className={cn(
                        "flex-1 rounded-xl border p-4 text-left transition-all",
                        (tenant?.aiProvider ?? null) === option.value
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/40 hover:border-border",
                      )}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {(tenant?.aiProvider === "claude_api" || tenant?.aiProvider === "openai") && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold">API-Konfiguration</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ai-api-key">API-Key</Label>
                        <Input
                          id="ai-api-key"
                          type="password"
                          placeholder="sk-..."
                          defaultValue=""
                          onBlur={(e) => {
                            if (e.target.value) {
                              startTransition(async () => {
                                try {
                                  await updateTenantAiSettings({ aiApiKey: e.target.value });
                                } catch {
                                  // Handle error
                                }
                              });
                            }
                          }}
                          disabled={isPending}
                        />
                        <p className="text-[10px] text-muted-foreground">Wird verschluesselt gespeichert.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-model">Modell (optional)</Label>
                        <Input
                          id="ai-model"
                          placeholder={tenant?.aiProvider === "openai" ? "gpt-4o-mini" : "claude-haiku-4-5"}
                          defaultValue={tenant?.aiModel ?? ""}
                          onBlur={(e) => {
                            startTransition(async () => {
                              try {
                                await updateTenantAiSettings({ aiModel: e.target.value || null });
                              } catch {
                                // Handle error
                              }
                            });
                          }}
                          disabled={isPending}
                        />
                        <p className="text-[10px] text-muted-foreground">Leer = Standard-Modell des Providers.</p>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* MAIL TAB */}
        <TabsContent value="mail" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Mail-Provider</h2>
            <div className="flex gap-3">
              {(["smtp", "graph"] as const).map((provider) => (
                <button key={provider} onClick={() => setMailProvider(provider)} className={cn("flex-1 rounded-xl border p-4 text-left transition-all", mailProvider === provider ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border")}>
                  <p className="text-sm font-semibold">{provider === "smtp" ? "SMTP" : "MS Graph"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{provider === "smtp" ? "Standard E-Mail Server" : "Microsoft 365 Integration"}</p>
                  {provider === "graph" && <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Erfordert IT-Freigabe</span>}
                </button>
              ))}
            </div>
          </section>

          {mailProvider === "smtp" && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">SMTP-Konfiguration</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Host</Label>
                  <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
                </div>
              </div>
            </section>
          )}

          {mailProvider === "graph" && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">MS Graph Konfiguration</h2>
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">MS Graph Integration erfordert eine IT-Freigabe und Azure AD App-Registrierung.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="graph-tenant">Azure Tenant ID</Label>
                  <Input id="graph-tenant" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graph-client">Client ID</Label>
                  <Input id="graph-client" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                </div>
              </div>
            </section>
          )}

          <AnimatedButton shine intensity="bold">Mail-Einstellungen speichern</AnimatedButton>
        </TabsContent>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Darstellung</h2>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium">Dark Mode als Standard</p>
                <p className="text-xs text-muted-foreground">Neue Benutzer starten im dunklen Modus.</p>
              </div>
              <Switch checked={darkModeDefault} onCheckedChange={setDarkModeDefault} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Quiz-Standardeinstellungen</h2>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium">Uebungsmodus erlauben</p>
                <p className="text-xs text-muted-foreground">Benutzer koennen freigegebene Quizzes im Uebungsmodus spielen.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium">Ergebnisse sofort anzeigen</p>
                <p className="text-xs text-muted-foreground">Zeigt richtig/falsch direkt nach jeder Frage.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </section>

          <AnimatedButton shine intensity="bold">Einstellungen speichern</AnimatedButton>
        </TabsContent>
      </Tabs>
    </div>
  );
}
