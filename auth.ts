import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials.email === "admin@thinkatrip.com" && credentials.password === "deals") {
          return { id: "1", name: "think a trip Admin", email: "admin@thinkatrip.com" }
        }
        return null
      }
    })
  ]
})
