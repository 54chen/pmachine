import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { useSession } from "next-auth/react"
import styles from '../components/layout.module.css'
import { useState, useEffect } from "react"
import AccessDenied from "../components/access-denied"


enum CODE {
  OK = 200, NO_LOGIN = 403, HAS_GEN = 203, NO_POAP = 404, ERROR = 500, NO_REC = 405
}
interface RetData {
  isFren: boolean,
  data: string,
  link: string,
  code: CODE,
  style: string,
}

const Frens = () => {

  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [retData, setRetData] = useState<RetData>({
    isFren: false,
    data: "LOADING, I AM REQUESTING THE RESULT!",
    link: "",
    code: CODE.OK,
    style: "loading"
  })

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/wishs")
      const json: RetData = await res.json()
      setRetData(json)
    }
    fetchData()
  }, [session])
  
  if (!session) {
    return (
      <Layout home>
        <AccessDenied />
      </Layout>
    )
  }
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  // If session exists, display content

  return (
    <Layout home={false}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {session && (


          <div className={utilStyles.claimDIV}>
            {(retData?.style == 'loading') && (<span className={utilStyles.loading}>{retData?.code}:{retData?.data}<img
              src="/images/loading.png" /></span>)}
            {(retData?.style !== 'loading') && (<span className={utilStyles.done}>{retData?.code}:{retData?.data}</span>)}
          </div>

        )}
      </section>
      <section className={utilStyles.headingMd}> </section>
      <section className={utilStyles.headingMd}> </section>
      <hr />
      {(retData?.code == CODE.NO_POAP) && (
        <div className={utilStyles.claimDIV}>
          <Link href={`https://www.twitter.com/John_0xFF`}>
            <a className={styles.buttonPrimaryClaim}>YOU CAN BE MY FREN! FOLLOWING! 关注!</a>
          </Link>
        </div>
      )}
    </Layout>
  )
}

export default Frens