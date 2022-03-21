import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import type { GetStaticProps } from 'next'
import { PostData } from '../lib/posts'
import Date from '../components/date'
import { signIn, useSession } from "next-auth/react"
import styles from '../components/layout.module.css'

type Props = {
  posts: [PostData]
}
function catchHello(){

}
const Home: NextPage<Props> = ({posts}:Props) => {
  const { data: session, status } = useSession()
  return (
    <Layout home>
    <Head>
      <title>{siteTitle}</title>
    </Head>
    <section className={utilStyles.headingMd}>
    {session && (
            <div className={utilStyles.claimDIV}>
                          
              <Link href={`/frens`}>
                <a className={styles.buttonPrimaryClaim}>Claim my POAP / 获取POAP链接</a>
              </Link>

            </div>
          )}
    </section>
    <section className={utilStyles.headingMd}> </section>
    <section className={utilStyles.headingMd}> </section>
<hr />
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map((post) => (

            <li className={utilStyles.listItem} key={post.id}>
              <Link href={`/posts/${post.id}`}>
                <a>{post.data.title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={post.data.date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
  </Layout>
  )
}

export default Home


export const getStaticProps: GetStaticProps = async () => {
  const posts = getSortedPostsData()
  return {
    props: {posts}
  }
}