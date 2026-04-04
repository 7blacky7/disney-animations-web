"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * AnswerEditor — Antwort-Definition fuer alle 11 Fragetypen im Quiz-Builder.
 *
 * Rendert das passende UI basierend auf dem Fragetyp:
 * - MC/Image/Timed: Optionen + korrekten Index markieren
 * - Wahr/Falsch: Toggle
 * - Fill-Blank: Korrekte Antwort
 * - Sorting/DragDrop: Items in korrekter Reihenfolge
 * - Matching: Paare definieren
 * - Slider: Min/Max/Korrekt/Toleranz
 * - FreeText: Keywords
 * - Code-Input: Template + Loesung + Sprache
 */

export interface QuestionData {
  id: string;
  type: string;
  title: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: boolean;
  items?: string[];
  correctOrder?: number[];
  matchLeft?: string[];
  matchRight?: string[];
  sliderMin?: number;
  sliderMax?: number;
  sliderCorrect?: number;
  sliderTolerance?: number;
  blankAnswer?: string;
  keywords?: string[];
  codeTemplate?: string;
  codeSolution?: string;
  programmingLanguage?: string;
  /** Terminal: Erwartete Befehle (mehrere Varianten moeglich) */
  expectedCommands?: string[];
  /** Terminal: Simulierte Ausgabe nach korrektem Befehl */
  expectedOutput?: string;
  /** Terminal: Prompt-Text (z.B. "user@linux:~$") */
  terminalPrompt?: string;
  /** Terminal: Hint bei falscher Eingabe */
  terminalHint?: string;
  timeLimit?: number;
  points?: number;
}

interface AnswerEditorProps {
  question: QuestionData;
  onUpdate: (updates: Partial<QuestionData>) => void;
}

export function AnswerEditor({ question, onUpdate }: AnswerEditorProps) {
  switch (question.type) {
    case "multiple_choice":
    case "image_choice":
    case "timed":
      return <MCEditor question={question} onUpdate={onUpdate} />;
    case "true_false":
      return <TrueFalseEditor question={question} onUpdate={onUpdate} />;
    case "fill_blank":
      return <FillBlankEditor question={question} onUpdate={onUpdate} />;
    case "sorting":
    case "drag_drop":
      return <SortingEditor question={question} onUpdate={onUpdate} />;
    case "matching":
      return <MatchingEditor question={question} onUpdate={onUpdate} />;
    case "slider":
      return <SliderEditor question={question} onUpdate={onUpdate} />;
    case "free_text":
      return <FreeTextEditor question={question} onUpdate={onUpdate} />;
    case "code_input":
      return <CodeInputEditor question={question} onUpdate={onUpdate} />;
    case "terminal":
      return <TerminalEditor question={question} onUpdate={onUpdate} />;
    default:
      return <p className="text-xs text-muted-foreground">Kein Antwort-Editor fuer diesen Typ.</p>;
  }
}

/** MC / Image Choice / Timed — Optionen + korrekte markieren */
function MCEditor({ question, onUpdate }: AnswerEditorProps) {
  const options = question.options ?? ["", "", "", ""];
  const correctIdx = question.correctIndex ?? 0;

  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-muted-foreground">Antwortoptionen (korrekte anklicken)</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ correctIndex: i })}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
              correctIdx === i
                ? "border-success bg-success text-white"
                : "border-border/40 text-muted-foreground hover:border-primary",
            )}
          >
            {correctIdx === i ? "✓" : String.fromCharCode(65 + i)}
          </button>
          <Input
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[i] = e.target.value;
              onUpdate({ options: newOpts });
            }}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            className="text-xs h-8"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => {
                const newOpts = options.filter((_, idx) => idx !== i);
                const newCorrect = correctIdx >= newOpts.length ? newOpts.length - 1 : correctIdx > i ? correctIdx - 1 : correctIdx;
                onUpdate({ options: newOpts, correctIndex: newCorrect });
              }}
              className="text-muted-foreground/40 hover:text-destructive"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => onUpdate({ options: [...options, ""] })}
      >
        + Option hinzufuegen
      </Button>
    </div>
  );
}

/** Wahr/Falsch — Toggle */
function TrueFalseEditor({ question, onUpdate }: AnswerEditorProps) {
  const correct = question.correctAnswer ?? true;
  return (
    <div className="flex items-center gap-3">
      <Label className="text-xs">Korrekte Antwort:</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onUpdate({ correctAnswer: true })}
          className={cn(
            "rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors",
            correct ? "border-success bg-success/10 text-success" : "border-border/40 hover:border-primary",
          )}
        >
          Wahr
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ correctAnswer: false })}
          className={cn(
            "rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors",
            !correct ? "border-success bg-success/10 text-success" : "border-border/40 hover:border-primary",
          )}
        >
          Falsch
        </button>
      </div>
    </div>
  );
}

/** Lueckentext — Korrekte Antwort */
function FillBlankEditor({ question, onUpdate }: AnswerEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-muted-foreground">Korrekte Antwort (Text mit ___ als Luecke in der Frage)</Label>
      <Input
        value={question.blankAnswer ?? ""}
        onChange={(e) => onUpdate({ blankAnswer: e.target.value })}
        placeholder="z.B. push"
        className="text-xs h-8"
      />
    </div>
  );
}

/** Sorting / Drag&Drop — Items in korrekter Reihenfolge */
function SortingEditor({ question, onUpdate }: AnswerEditorProps) {
  const items = question.items ?? ["", "", ""];
  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-muted-foreground">Elemente in KORREKTER Reihenfolge (werden dem User gemischt angezeigt)</Label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
            {i + 1}
          </span>
          <Input
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[i] = e.target.value;
              onUpdate({ items: newItems });
            }}
            placeholder={`Element ${i + 1}`}
            className="text-xs h-8"
          />
          {items.length > 2 && (
            <button type="button" onClick={() => onUpdate({ items: items.filter((_, idx) => idx !== i) })} className="text-muted-foreground/40 hover:text-destructive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => onUpdate({ items: [...items, ""] })}>
        + Element hinzufuegen
      </Button>
    </div>
  );
}

/** Matching — Paare definieren */
function MatchingEditor({ question, onUpdate }: AnswerEditorProps) {
  const left = question.matchLeft ?? ["", ""];
  const right = question.matchRight ?? ["", ""];
  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-muted-foreground">Paare definieren (gleicher Index = korrektes Paar)</Label>
      {left.map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={left[i] ?? ""}
            onChange={(e) => { const n = [...left]; n[i] = e.target.value; onUpdate({ matchLeft: n }); }}
            placeholder={`Links ${i + 1}`}
            className="text-xs h-8 flex-1"
          />
          <span className="text-muted-foreground/40">↔</span>
          <Input
            value={right[i] ?? ""}
            onChange={(e) => { const n = [...right]; n[i] = e.target.value; onUpdate({ matchRight: n }); }}
            placeholder={`Rechts ${i + 1}`}
            className="text-xs h-8 flex-1"
          />
          {left.length > 2 && (
            <button type="button" onClick={() => { onUpdate({ matchLeft: left.filter((_, idx) => idx !== i), matchRight: right.filter((_, idx) => idx !== i) }); }} className="text-muted-foreground/40 hover:text-destructive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => onUpdate({ matchLeft: [...left, ""], matchRight: [...right, ""] })}>
        + Paar hinzufuegen
      </Button>
    </div>
  );
}

/** Slider — Min/Max/Korrekt/Toleranz */
function SliderEditor({ question, onUpdate }: AnswerEditorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-[10px]">Minimum</Label>
        <Input type="number" value={question.sliderMin ?? 0} onChange={(e) => onUpdate({ sliderMin: Number(e.target.value) })} className="text-xs h-8" />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Maximum</Label>
        <Input type="number" value={question.sliderMax ?? 100} onChange={(e) => onUpdate({ sliderMax: Number(e.target.value) })} className="text-xs h-8" />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Korrekt</Label>
        <Input type="number" value={question.sliderCorrect ?? 50} onChange={(e) => onUpdate({ sliderCorrect: Number(e.target.value) })} className="text-xs h-8" />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Toleranz ±</Label>
        <Input type="number" value={question.sliderTolerance ?? 5} onChange={(e) => onUpdate({ sliderTolerance: Number(e.target.value) })} className="text-xs h-8" />
      </div>
    </div>
  );
}

/** Freitext — Keywords */
function FreeTextEditor({ question, onUpdate }: AnswerEditorProps) {
  const keywords = question.keywords ?? [""];
  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-muted-foreground">Schluesselwoerter (mind. 1 muss enthalten sein)</Label>
      {keywords.map((kw, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={kw}
            onChange={(e) => { const n = [...keywords]; n[i] = e.target.value; onUpdate({ keywords: n }); }}
            placeholder={`Schluesselwort ${i + 1}`}
            className="text-xs h-8"
          />
          {keywords.length > 1 && (
            <button type="button" onClick={() => onUpdate({ keywords: keywords.filter((_, idx) => idx !== i) })} className="text-muted-foreground/40 hover:text-destructive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => onUpdate({ keywords: [...keywords, ""] })}>
        + Schluesselwort
      </Button>
    </div>
  );
}

/** Code-Input — Template + Loesung + Sprache */
function CodeInputEditor({ question, onUpdate }: AnswerEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px]">Programmiersprache</Label>
        <select
          value={question.programmingLanguage ?? "javascript"}
          onChange={(e) => onUpdate({ programmingLanguage: e.target.value })}
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Code-Geruest (wird dem User angezeigt)</Label>
        <Textarea
          value={question.codeTemplate ?? ""}
          onChange={(e) => onUpdate({ codeTemplate: e.target.value })}
          placeholder="function add(a, b) {&#10;  // Dein Code hier&#10;}"
          rows={4}
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Musterloesung (fuer Auswertung)</Label>
        <Textarea
          value={question.codeSolution ?? ""}
          onChange={(e) => onUpdate({ codeSolution: e.target.value })}
          placeholder="function add(a, b) {&#10;  return a + b;&#10;}"
          rows={4}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

/** Terminal — Erwartete Befehle + Simulierte Ausgabe */
function TerminalEditor({ question, onUpdate }: AnswerEditorProps) {
  const commands = question.expectedCommands ?? [""];
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px]">Terminal-Prompt (optional, z.B. "user@linux:~$")</Label>
        <Input
          value={question.terminalPrompt ?? ""}
          onChange={(e) => onUpdate({ terminalPrompt: e.target.value })}
          placeholder="user@linux:~$"
          className="font-mono text-xs h-8"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] text-muted-foreground">Erwartete Befehle (mehrere Varianten moeglich, case-insensitive)</Label>
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={cmd}
              onChange={(e) => { const n = [...commands]; n[i] = e.target.value; onUpdate({ expectedCommands: n }); }}
              placeholder={`z.B. ls -la oder ls -al`}
              className="font-mono text-xs h-8"
            />
            {commands.length > 1 && (
              <button type="button" onClick={() => onUpdate({ expectedCommands: commands.filter((_, idx) => idx !== i) })} className="text-muted-foreground/40 hover:text-destructive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => onUpdate({ expectedCommands: [...commands, ""] })}>
          + Variante hinzufuegen
        </Button>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Simulierte Ausgabe nach korrektem Befehl (optional)</Label>
        <Textarea
          value={question.expectedOutput ?? ""}
          onChange={(e) => onUpdate({ expectedOutput: e.target.value })}
          placeholder="total 42&#10;drwxr-xr-x 2 user user 4096 Apr 4 12:00 ."
          rows={3}
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px]">Hint bei falscher Eingabe (optional)</Label>
        <Input
          value={question.terminalHint ?? ""}
          onChange={(e) => onUpdate({ terminalHint: e.target.value })}
          placeholder="Tipp: Nutze ls mit der Option -la"
          className="text-xs h-8"
        />
      </div>
    </div>
  );
}
