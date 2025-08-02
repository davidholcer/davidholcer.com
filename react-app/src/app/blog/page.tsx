'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';

interface BlogPostData {
  slug: string
  title: string
  date: string
  content: string
  description: string
  image?: string
  links?: {
    blog?: string;
    site?: string;
    code?: string;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([])

  useEffect(() => {
    // Fetch blog posts from the content directory
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        
        // Debug: Log the posts to see what we're getting
        console.log('Blog posts data:', data)
        
        // Filter out posts without proper title or content
        const validPosts = data.filter((post: BlogPostData) => {
          // Check if the post has content and try to extract title from frontmatter if needed
          if (!post.content || post.content.trim().length === 0) return false;
          
          
          return post.title && 
                 post.title.toLowerCase() !== 'untitled' && 
                 post.slug;
        })
        
        setPosts(validPosts)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      }
    }

    fetchPosts()
  }, [])

  const handleImageClick = (e: React.MouseEvent, post: BlogPostData) => {
    e.stopPropagation();
    // Prioritize site link, then blog, then code
    const targetUrl = post.links?.site || post.links?.blog || post.links?.code;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full px-4 md:px-12 lg:px-24 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            // Debug: Log each post's image
            console.log(`Post "${post.title}" image:`, post.image)
            
            // Ensure image path is properly formatted
            const imagePath = post.image ? post.image.startsWith('/') ? post.image : `/${post.image}` : null
            
            return (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group cursor-pointer block"
              >
                {/* Standalone Image Card - Clickable */}
                <div 
                  className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-slate-800 shadow-lg cursor-pointer"
                  onClick={(e) => handleImageClick(e, post)}
                >
                  {imagePath ? (
                    <Image
                      src={imagePath}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        console.error('Image failed to load:', imagePath)
                        // Hide the image element if it fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', imagePath)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                        <path d="M14.14 11.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                      </svg>
                    </div>
                  )}
                  {/* Overlay to indicate clickability */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                      Click to read
                    </div>
                  </div>
                </div>

                {/* Separate Text Content Group */}
                <div className="space-y-4">
                  {/* Title */}
                  <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  {/* Date */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-white leading-relaxed line-clamp-3">
                    {post.description || 'Click to read more...'}
                  </p>
                  
                  {/* Links */}
                  {post.links && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.links.blog && (
                        <Link
                          href={post.links.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Blog
                        </Link>
                      )}
                      {post.links.site && (
                        <Link
                          href={post.links.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Site
                        </Link>
                      )}
                      {post.links.code && (
                        <Link
                          href={post.links.code}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Code
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}