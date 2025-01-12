import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: { scope: "repo read:org" }, // Request access to repositories and organizations
      },
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/"
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };