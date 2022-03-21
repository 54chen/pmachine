import { Session } from "next-auth"
import { useSession, signIn, signOut } from "next-auth/react"

interface ISession extends Session{
    t: string, s:string
}

export default function Access() {
  const { data } = useSession()
  const { t:accessToken } = data as ISession

  return <>Access Token: {accessToken}</>
}
