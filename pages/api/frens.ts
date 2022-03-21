// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import Twitter, { TwitterOptions } from "twitter-lite";
import { getSession } from "next-auth/react"
import { Session } from "next-auth"
import { table } from "./utils/Airtable"
import { CODE,RetData } from '../../lib/posts';

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
  fields: {link: string, twitter: string, date: string }
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


  try {
    const query = table.select({ filterByFormula: `twitter = '${session.user?.name}'` });
    const content = await query.firstPage()

    if(content.length==0) {
      ///
      res.status(CODE.NO_REC).send({
        isFren,
        data: "NO RECORD",
        code: CODE.NO_REC,
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
    const s: Frens = await client.get('friendships/lookup', { 'screen_name': 'Johnchan' })
    console.log(s)
    s.map((f) => {
      f.connections.map((c) => {
        isFren = (c == 'following')
      })
    })
    if(!isFren) {
        ///
        res.status(CODE.NO_POAP).send({
          isFren,
          data: "NO FOLLOWING",
          code: CODE.NO_POAP,
          link: ""
        })
        return
    }

    const formattedRecords:Record[] = content.map((rec) => {
      return {
        id: rec.id,
        fields: {
          link:rec.fields.link as string,
          twitter: rec.fields.twitter as string,
          date: rec.fields.date as string 
        }
      }
    });
    if (formattedRecords.length > 0) {
      const r = formattedRecords[0] as Record
      ///
      res.status(CODE.HAS_GEN).send({
        isFren,
        data: "Your link was generated! Date:" + r.fields.date,
        code: CODE.HAS_GEN,
        link: r.fields.link
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
