import { betterAuth } from "better-auth";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "./auth-schema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
  },
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
