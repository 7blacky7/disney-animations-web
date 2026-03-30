import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

/**
 * Better-Auth Server Configuration
 *
 * Features:
 * - Email/Password authentication
 * - Session management (DB-backed)
 * - MS Entra SSO prepared (deactivated for now)
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Dev: disabled for ease
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24h
  },

  // MS Entra SSO — prepared but deactivated
  // socialProviders: {
  //   microsoft: {
  //     clientId: process.env.MICROSOFT_CLIENT_ID!,
  //     clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  //     tenantId: process.env.MICROSOFT_TENANT_ID,
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session;
