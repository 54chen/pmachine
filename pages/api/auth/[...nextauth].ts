import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

export interface ParamsType {
  screen_name: string
}

export interface AccounType {
  params: ParamsType
  accessToken: string
}


export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_ID as string,
      clientSecret: process.env.TWITTER_SECRET as string,
    })
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.t = account.oauth_token
        token.s = account.oauth_token_secret
        token.sn = profile?.name
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      // session.t = token.t
      // session.s = token.s
      // session.sn = token.sn
      return session
    }
  },
})