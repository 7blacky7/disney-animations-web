import { createAuthClient } from "better-auth/react";

/**
 * Better-Auth Client — React Hooks fuer Auth-State
 *
 * Nutzung:
 * ```tsx
 * const { signIn, signUp, signOut, useSession } = authClient;
 * ```
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
