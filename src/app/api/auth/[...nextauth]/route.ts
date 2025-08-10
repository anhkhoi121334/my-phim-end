import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

// Secret key for JWT from env variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          // Find user in MongoDB
          const user = await User.findOne({ email: credentials.email });
          
          if (!user || !user.passwordHash) {
            return null;
          }
          
          // Verify password with bcrypt
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValid) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
            image: user.image
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          try {
            await connectToDatabase();
            
            // Check if user exists in MongoDB
            let dbUser = await User.findOne({ email: user.email });
            
            if (!dbUser) {
              // Create new user in MongoDB
              dbUser = await User.create({
                fullName: user.name,
                email: user.email,
                image: user.image,
                provider: 'google',
                role: 'user'
              });
            }
            
            return {
              ...token,
              id: dbUser._id.toString(),
              role: dbUser.role,
              image: user.image || dbUser.image
            };
          } catch (error) {
            console.error("Google auth error:", error);
            return token;
          }
        }
        
        return {
          ...token,
          id: user.id,
          role: user.role || "user",
          image: user.image
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.image as string | undefined;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || JWT_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 