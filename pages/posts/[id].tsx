import Layout from "../../components/layout"
import { GetStaticPaths, GetStaticProps } from "next"

import { getAllPostIds,getPostData,getHtml } from "../../lib/posts"
import { ParsedUrlQuery } from "querystring"
import { PostData } from "../../lib/posts"
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'

type Props = {
  post: PostData,
  postHtml: string
}

export default function Post({post, postHtml} : Props) {

  return (
    <Layout home={false}>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <article>
      <h1 className={utilStyles.headingXl}>{post.data.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={post.data.date} />
      </div>      
      <div dangerouslySetInnerHTML={{ __html: postHtml }} />
      </article>

    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

interface Iparams extends ParsedUrlQuery {
  id: string
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as Iparams;
  const post = getPostData(id);
  const content = await getHtml(post.content);
  return { props: { post:post, postHtml:content} }
}

