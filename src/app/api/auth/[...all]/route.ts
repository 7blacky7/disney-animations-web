import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Auth API Route — Catch-all Handler fuer better-auth
 *
 * Handles: /api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out,
 *          /api/auth/session, /api/auth/callback/*
 */
export const { GET, POST } = toNextJsHandler(auth);
