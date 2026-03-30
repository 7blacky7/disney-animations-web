"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";

/**
 * Settings Page — Tenant Branding + Mail + General Config
 * Phase 9: Branding-Editor, Mail-Config, General Settings
 * TODO: Connect to DB for tenant config persistence
 */

const ACCENT_PRESETS = [
  { id: "indigo", label: "Indigo", color: "oklch(0.55 0.20 270)" },
  { id: "emerald", label: "Smaragd", color: "oklch(0.55 0.17 160)" },
  { id: "rose", label: "Rose", color: "oklch(0.55 0.20 350)" },
  { id: "amber", label: "Amber", color: "oklch(0.65 0.18 75)" },
  { id: "violet", label: "Violett", color: "oklch(0.55 0.22 300)" },
  { id: "custom", label: "Eigene", color: "" },
];

export default function SettingsPage() {
  const [tenantName, setTenantName] = useState("Demo Firma");
  const [selectedAccent, setSelectedAccent] = useState("indigo");
  const [customColor, setCustomColor] = useState("#4F46E5");
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [mailProvider, setMailProvider] = useState<"graph" | "smtp">("smtp");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firmen-Branding, Mail-Konfiguration und allgemeine Einstellungen.
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground text-xs">Logo</div>
                  <Button variant="outline" size="sm">Hochladen</Button>
                </div>
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="space-y-2">
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
                  <span className="font-heading text-sm font-bold text-primary">{tenantName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold">{tenantName}</p>
                  <p className="text-xs text-muted-foreground">Quiz Platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                <AnimatedButton size="sm" shine>Primaer-Button</AnimatedButton>
                <Button variant="outline" size="sm">Sekundaer</Button>
              </div>
            </div>
          </section>

          <AnimatedButton shine intensity="bold">Branding speichern</AnimatedButton>
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
