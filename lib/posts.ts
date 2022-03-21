import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {remark} from 'remark'
import html from 'remark-html'

export interface PostData{
  id: string;
  data:{
      [key: string] : any
  };
  content: string
}

const postsDirectory = path.join(process.cwd(), 'posts')

export function getPostData(id:string): PostData {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const {data, content} = matter(fileContents)

  // Combine the data with the id
  return {
    id,
    data: data,
    content: content
  }
}

export async function getHtml(content: string): Promise<string>{
  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()
  return contentHtml
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export function getSortedPostsData() : PostData[]{
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const {data,content} = matter(fileContents)

    // Combine the data with the id
    return {  
      id,
      data: data,
      content: content
    }
  })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.data.date < b.data.date) {
      return 1
    } else {
      return -1
    }
  })
}