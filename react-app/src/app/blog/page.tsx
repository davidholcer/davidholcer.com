'use client'

import React, { useEffect, useState } from 'react'
import BlogPost from '@/components/BlogPost';

interface BlogPostData {
  slug: string
  title: string
  date: string
  content: string
  teaser: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPostData | null>(null)

  useEffect(() => {
    // Fetch blog posts from the content directory
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        
        // Filter out posts without proper title or content
        const validPosts = data.filter((post: BlogPostData) => 
          post.title && 
          post.title.toLowerCase() !== 'untitled' && 
          post.content && 
          post.content.trim().length > 0 &&
          post.slug
        )
        
        setPosts(validPosts)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    window.dispatchEvent(new Event('locomotive-update'));
  }, [posts]);

  useEffect(() => {
    window.dispatchEvent(new Event('locomotive-update'));
  }, [selectedPost]);

  return (
    <div className="container mx-auto px-4 py-16" data-scroll-section>
      <h1 className="text-4xl font-medium mb-8 saans" data-scroll data-scroll-speed="0.5">Blog</h1>
      
      {selectedPost ? (
        <div className="prose prose-lg max-w-none" data-scroll>
          <button 
            onClick={() => setSelectedPost(null)}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to all posts
          </button>
          <h2 className="text-3xl font-medium mb-2 saans">{selectedPost.title}</h2>
          <p className="text-gray-600 mb-8">{selectedPost.date}</p>
          <BlogPost content={selectedPost.content} />
        </div>
      ) : (
        <div className="grid gap-8" data-scroll>
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <h2 className="text-2xl font-medium mb-2 saans">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.date}</p>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {post.teaser || 'Click to read more...'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}