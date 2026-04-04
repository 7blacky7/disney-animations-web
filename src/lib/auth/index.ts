import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { sessions } from "@/lib/db/schema/sessions";
import { accounts } from "@/lib/db/schema/accounts";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";

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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Dev: disabled for ease
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // better-auth ignoriert Custom-Felder im before-Hook.
          // Daher: Nach User-Erstellung direkt in DB updaten.
          const [defaultTenant] = await db
            .select({ id: tenants.id })
            .from(tenants)
            .limit(1);

          if (defaultTenant) {
            await db
              .update(users)
              .set({ tenantId: defaultTenant.id, role: "user" })
              .where(eq(users.id, user.id));
          }
        },
      },
    },
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
