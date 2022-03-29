// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import Twitter, { TwitterOptions } from "twitter-lite";
import { getSession } from "next-auth/react"
import { Session } from "next-auth"
import { table2 } from "./utils/Airtable"
import Airtable from 'airtable';
import { CODE, RetData } from '../../lib/posts';


interface ISession extends Session {
  t: string, s: string
}

type Folist = {
  "users": { "screen_name": string }[],
  "next_cursor": number
}

type Record = {
  id: string,
  fields: { link: string, twitter: string, date: string }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RetData>
) {
  const session = await getSession({ req })
  let isFren = false;

  if (!session) {
    ///
    res.status(CODE.NO_LOGIN).send({
      isFren,
      data: "You must be signed in to view the protected content on this page.",
      code: CODE.NO_LOGIN,
      link: ""
    })
    return
  }
  const { t: accessToken, s: secret } = session as ISession

  const screenName = session.user?.name

  if (screenName != 'JohnChan 🏴，📜，🤝') {
    ///
    res.status(CODE.NO_LOGIN).send({
      isFren,
      data: "bye.",
      code: CODE.NO_LOGIN,
      link: ""
    })
    return
  }

  try {
    const config: TwitterOptions = {
      consumer_key: process.env.TWITTER_ID as string,
      consumer_secret: process.env.TWITTER_SECRET as string,
      access_token_key: accessToken,
      access_token_secret: secret,
    }
    const client = new Twitter(config)

    let cursor = -1
    while (cursor != 0) {
      const s: Folist = await client.get('followers/list', { 'screen_name': 'John_0xFF', 'cursor': cursor, 'count': 200 })
      s.users.map((fname) => {
        const field: Airtable.FieldSet = { "twitter": fname.screen_name + "" }
        table2.create([{ fields: field }])
      })
      cursor = s.next_cursor
    }

  } catch (error) {
    console.error(error);
    ///
    res.status(CODE.ERROR).send({
      isFren,
      data: "ERROR",
      code: CODE.ERROR,
      link: ""
    })
    return
  }

  res.status(CODE.OK).send({
    isFren,
    data: "OK",
    code: CODE.OK,
    link: ""
  })
  return
}
