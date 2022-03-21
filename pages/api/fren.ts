// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import Twitter, { TwitterOptions } from "twitter-lite";
import { getSession } from "next-auth/react"
import { Session } from "next-auth"
import { table2 } from "./utils/Airtable"
import Airtable from 'airtable';

enum CODE {
  OK = 200, NO_LOGIN = 403, HAS_GEN = 203, NO_POAP = 404, ERROR = 500, NO_REC = 405
}

type Data = {
  isFren: boolean,
  data: string,
  link: string,
  code: CODE,
}

interface ISession extends Session {
  t: string, s: string
}

type Frens = {
  "name": string,
  "screen_name": string,
  "id": number,
  "id_str": string,
  "connections": [
    string
  ]
}[]

type Record = {
  id: string,
  fields: { link: string, twitter: string, date: string }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
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
  try {
    const query = table2.select({ filterByFormula: `twitter = '${screenName}'` });
    const content = await query.firstPage()

    if (content.length > 0) {
      ///
      res.status(CODE.HAS_GEN).send({
        isFren,
        data: "ALREADY RECORD",
        code: CODE.HAS_GEN,
        link: ""
      })
      return
    }

    const config: TwitterOptions = {
      consumer_key: process.env.TWITTER_ID as string,
      consumer_secret: process.env.TWITTER_SECRET as string,
      access_token_key: accessToken,
      access_token_secret: secret,
    }
    const client = new Twitter(config)
    const s: Frens = await client.get('friendships/lookup', { 'screen_name': 'John_0xFF' })
    console.log(s)
    s.map((f) => {
      f.connections.map((c) => {
        isFren = (c == 'following')
      })
    })
    if (!isFren) {
      ///
      res.status(CODE.NO_POAP).send({
        isFren,
        data: "NO FOLLOWING",
        code: CODE.NO_POAP,
        link: ""
      })
      return
    }

    const field:Airtable.FieldSet = {"twitter":screenName+""}
    const createdRecords = await table2.create([ { fields: field}]);
    
    const createdRecord = {
      id: createdRecords[0].id,
      fields: createdRecords[0].fields,
    };
    if (createdRecord.id == null) {
      res.status(CODE.ERROR).send({
        isFren,
        data: "DB ERROR",
        code: CODE.ERROR,
        link: ""
      })
      return
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
