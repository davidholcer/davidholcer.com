import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  try {
    const postsDirectory = path.join(process.cwd(), 'public/assets/blog')
    const files = fs.readdirSync(postsDirectory)

    const posts = files.map((filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Check status - skip if draft or archive
      const status = data.status || 'published';
      if (status === 'draft' || status === 'archive') {
        return null;
      }

      return {
        slug: filename.replace('.mdx', ''),
        author: data.author,
        title: data.title,
        date: data.date,
        displayDescription: data.displayDescription,
        description: data.description,
        image: data.image, // Add image metadata
        glowColor: data.glowColor, // Add glowColor metadata
        categories: data.categories || '', // Add categories metadata
        status: status,
        content,
      }
    }).filter(post => post !== null)

    // Sort posts by date
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error reading blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
} 