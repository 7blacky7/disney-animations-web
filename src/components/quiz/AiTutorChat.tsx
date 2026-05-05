"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendTutorMessage } from "@/lib/actions/ai/chat";
import { dbg } from "@/lib/debug";
import { cn } from "@/lib/utils";

/**
 * AiTutorChat — Chat-Bubble Widget für KI-Tutor im Quiz-Player
 *
 * Floating Action Button unten rechts. Öffnet Chat-Panel.
 * Nutzt sendTutorMessage() Server Action für AI-Antworten.
 * Nur sichtbar wenn Tenant ai_enabled=true (Prop).
 *
 * Animation Principles: Anticipation (FAB pulse), Follow-through (slide-in),
 * Appeal (friendly chat UI)
 */

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiTutorChatProps {
  /** Only render if AI is enabled for this tenant */
  enabled: boolean;
  /** Current question text for context */
  questionContext?: string;
  /** Quiz title */
  quizTitle?: string;
  /** Programming language (for code questions) */
  programmingLanguage?: string;
}

export function AiTutorChat({
  enabled,
  questionContext,
  quizTitle,
  programmingLanguage,
}: AiTutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    dbg.quiz("AI-Tutor Frage", { message: trimmed.slice(0, 50) });

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, timestamp: new Date() },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendTutorMessage({
        message: trimmed,
        questionContext,
        quizTitle,
        programmingLanguage,
        sessionId,
      });

      setSessionId(result.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response, timestamp: new Date() },
      ]);

      dbg.quiz("AI-Tutor Antwort", { durationMs: result.durationMs });
    } catch (err) {
      dbg.quiz.error("AI-Tutor Fehler", { error: err });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Entschuldigung, ich konnte deine Frage nicht verarbeiten. Bitte versuche es erneut.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, questionContext, quizTitle, programmingLanguage, sessionId]);

  if (!enabled) return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "flex h-14 w-14 items-center justify-center",
              "rounded-full bg-primary text-primary-foreground shadow-lg",
              "hover:bg-primary/90 transition-colors",
            )}
            aria-label="KI-Tutor öffnen"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.32L2 22l5.68-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="16" cy="12" r="1" fill="currentColor" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "flex h-[480px] w-[360px] flex-col",
              "rounded-2xl border border-border/50 bg-card shadow-2xl",
              "overflow-hidden",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">KI-Tutor</p>
                  <p className="text-[10px] text-muted-foreground">
                    Hilft dir bei der Aufgabe
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Chat schließen"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <p className="text-2xl mb-2">👋</p>
                    <p className="text-sm font-medium">Hallo!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ich bin dein KI-Tutor. Stell mir eine Frage zur aktuellen Aufgabe!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 px-3 py-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted-foreground/40"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Frag mich etwas..."
                  disabled={isLoading}
                  className={cn(
                    "flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground/60",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                    "disabled:opacity-50",
                  )}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
