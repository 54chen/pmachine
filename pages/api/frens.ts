// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import Twitter, { TwitterOptions } from "twitter-lite";
import { getSession } from "next-auth/react"
import { Session } from "next-auth"
import { CODE, RetData } from '../../lib/posts';
import { prisma } from '../../lib/prisma'

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
  const { t: accessToken, s: secret, sn: screen_name } = session as ISession

  try {
    if (typeof screen_name !== "string" || screen_name == "") {
      res.status(CODE.NO_LOGIN).send({
        isFren,
        data: "You must be signed in to view the protected content on this page.",
        code: CODE.NO_LOGIN,
        link: ""
      })
      return
    }

    const poaps = await prisma.poaps.findFirst({
      where: {
        author: screen_name
      }
    })

    if (poaps != null && (poaps.link != null || poaps.link != "")) {
      res.status(CODE.HAS_GEN).send({
        isFren: true,
        data: "ALREADY GENERATE",
        code: CODE.HAS_GEN,
        link: poaps.link
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


    const result = await prisma.$executeRaw`UPDATE Poaps SET author = ${screen_name} where author='' limit 1;`
    if (result < 1) {
      res.status(CODE.ERROR).send({
        isFren,
        data: "NO POAPS ALREADY",
        code: CODE.ERROR,
        link: ""
      })
      return
    } 

    const npoaps = await prisma.poaps.findFirst({
      where: {
        author: screen_name
      }
    })
    res.status(CODE.OK).send({
      isFren: true,
      data: "OK",
      code: CODE.OK,
      link: npoaps?.link?npoaps.link:""
    })
    return
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
 
}
