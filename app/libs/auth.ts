import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 🔥 First time login → user is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        return token;
      }

      // 🔥 No user in callback → coming from session refresh or page load
      if (!token.id) return token;

      // 🔥 Fetch user stored by UpstashRedisAdapter
      const dbUser = await db.get(`user:${token.id}`) as {
        id: string,
        email: string,
        name: string,
        image: string,
      }

      if (!dbUser) return token;

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.image,
      };
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    },
  },
};
