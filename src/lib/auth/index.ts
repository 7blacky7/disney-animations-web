import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { sessions } from "@/lib/db/schema/sessions";
import { accounts } from "@/lib/db/schema/accounts";

/**
 * Better-Auth Server Configuration
 *
 * Features:
 * - Email/Password authentication
 * - Session management (DB-backed)
 * - MS Entra SSO prepared (deactivated for now)
 */
export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.50.10:3000",
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
    },
  }),

  advanced: {
    generateId: (_opts?: { model?: string }) => crypto.randomUUID(),
  },

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
