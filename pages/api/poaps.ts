// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import Twitter, { TwitterOptions } from "twitter-lite";
import { getSession } from "next-auth/react"
import { Session } from "next-auth"
import { CODE, RetData } from '../../lib/posts';
import fs from 'fs'
import { prisma } from '../../lib/prisma'

interface ISession extends Session {
  t: string, s: string
}

type Folist = {
  "users": { "screen_name": string }[],
  "next_cursor": number
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
    fs.readFile('/Users/chenzhen/Documents/workspace/pmachine/pages/api/links.csv', async function (err, data) {
      if (err) throw err;
      const arr = data.toString().replace(/\r\n/g, '\n').split('\n');
      const records: {link:string, author:string}[]  = arr.map((link)=>{ return {link,author:""} })
      const r = await prisma.poaps.createMany({ data: records, skipDuplicates: true })
      console.log(r.count)
    });
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
