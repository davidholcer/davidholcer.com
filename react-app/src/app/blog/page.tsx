'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';

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

// Adaptive Image Card Component
const AdaptiveImageCard: React.FC<{
  imagePath: string | null;
  postTitle: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({ imagePath, postTitle, onClick }) => {
  const imageDimensions = useImageDimensions(imagePath);
  
  // Calculate aspect ratio based on image dimensions
  const aspectRatio = imageDimensions?.aspectRatio || 4/3;
  const aspectRatioStyle = { aspectRatio: aspectRatio };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-slate-800 shadow-lg cursor-pointer"
      style={aspectRatioStyle}
      onClick={onClick}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={postTitle}
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
  );
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

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

  // Date filtering and sorting logic
  const getFilteredAndSortedPosts = () => {
    let filtered = posts;

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'last-month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'last-3-months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'last-6-months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'last-year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(post => {
        const postDate = new Date(post.date);
        return postDate >= cutoffDate;
      });
    }

    // Apply month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.date);
        const month = postDate.getMonth() + 1; // getMonth() returns 0-11
        return month.toString() === selectedMonth;
      });
    }

    // Apply year filter
    if (selectedYears.length > 0) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.date);
        const year = postDate.getFullYear().toString();
        return selectedYears.includes(year);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  };

  const clearAllFilters = () => {
    setSortOrder('newest');
    setSelectedMonth('all');
    setDateRange('all');
    setSelectedYears([]);
  };

  return (
    <div className="w-full pt-32">
      <div className="relative w-full px-4 md:px-12 lg:px-24 py-20">
        {/* Date Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* Sort Order */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="text-gray-700 dark:text-gray-300"
              >
                Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort order"
              onAction={(key) => setSortOrder(key as 'newest' | 'oldest')}
              className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2"
            >
              <DropdownItem key="newest">Newest First</DropdownItem>
              <DropdownItem key="oldest">Oldest First</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Month Filter */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="text-gray-700 dark:text-gray-300"
              >
                Month: {selectedMonth === 'all' ? 'All Months' : `Month ${selectedMonth}`}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Month filter"
              onAction={(key) => setSelectedMonth(key as string)}
              className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2"
            >
              <DropdownItem key="all">All Months</DropdownItem>
              <DropdownItem key="1">January</DropdownItem>
              <DropdownItem key="2">February</DropdownItem>
              <DropdownItem key="3">March</DropdownItem>
              <DropdownItem key="4">April</DropdownItem>
              <DropdownItem key="5">May</DropdownItem>
              <DropdownItem key="6">June</DropdownItem>
              <DropdownItem key="7">July</DropdownItem>
              <DropdownItem key="8">August</DropdownItem>
              <DropdownItem key="9">September</DropdownItem>
              <DropdownItem key="10">October</DropdownItem>
              <DropdownItem key="11">November</DropdownItem>
              <DropdownItem key="12">December</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Year Filter */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="text-gray-700 dark:text-gray-300"
              >
                Year: {selectedYears.length === 0 ? 'All Years' : 
                  selectedYears.length === 1 ? selectedYears[0] : 
                  `${selectedYears.length} Years`}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Year filter"
              selectionMode="multiple"
              selectedKeys={selectedYears}
              onSelectionChange={(keys) => setSelectedYears(Array.from(keys) as string[])}
              className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2"
            >
              <DropdownItem key="2024" className="text-center">{selectedYears.includes('2024') ? '✓ 2024' : '2024'}</DropdownItem>
              <DropdownItem key="2023" className="text-center">{selectedYears.includes('2023') ? '✓ 2023' : '2023'}</DropdownItem>
              <DropdownItem key="2022" className="text-center">{selectedYears.includes('2022') ? '✓ 2022' : '2022'}</DropdownItem>
              <DropdownItem key="2021" className="text-center">{selectedYears.includes('2021') ? '✓ 2021' : '2021'}</DropdownItem>
              <DropdownItem key="2020" className="text-center">{selectedYears.includes('2020') ? '✓ 2020' : '2020'}</DropdownItem>
              <DropdownItem key="2019" className="text-center">{selectedYears.includes('2019') ? '✓ 2019' : '2019'}</DropdownItem>
              <DropdownItem key="2018" className="text-center">{selectedYears.includes('2018') ? '✓ 2018' : '2018'}</DropdownItem>
              <DropdownItem key="2017" className="text-center">{selectedYears.includes('2017') ? '✓ 2017' : '2017'}</DropdownItem>
              <DropdownItem key="2016" className="text-center">{selectedYears.includes('2016') ? '✓ 2016' : '2016'}</DropdownItem>
              <DropdownItem key="2015" className="text-center">{selectedYears.includes('2015') ? '✓ 2015' : '2015'}</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Date Range Filter */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="text-gray-700 dark:text-gray-300"
              >
                Range: {dateRange === 'all' ? 'All Time' : 
                  dateRange === 'last-month' ? 'Last Month' :
                  dateRange === 'last-3-months' ? 'Last 3 Months' :
                  dateRange === 'last-6-months' ? 'Last 6 Months' :
                  'Last Year'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Date range filter"
              onAction={(key) => setDateRange(key as string)}
              className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2"
            >
              <DropdownItem key="all">All Time</DropdownItem>
              <DropdownItem key="last-month">Last Month</DropdownItem>
              <DropdownItem key="last-3-months">Last 3 Months</DropdownItem>
              <DropdownItem key="last-6-months">Last 6 Months</DropdownItem>
              <DropdownItem key="last-year">Last Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Clear Filters */}
          <Button 
            variant="flat" 
            color="danger"
            onPress={clearAllFilters}
            className="text-sm"
          >
            Clear All
          </Button>
        </div>

        <MasonryGrid columns={3} gap={48} className="w-full">
          {getFilteredAndSortedPosts().map((post) => {
            // Debug: Log each post's image
            console.log(`Post "${post.title}" image:`, post.image)
            
            // Ensure image path is properly formatted
            const imagePath = post.image ? post.image.startsWith('/') ? post.image : `/${post.image}` : null
            
            return (
              <div key={post.slug} className="mb-8">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="group cursor-pointer block"
                >
                  {/* Standalone Image Card - Clickable */}
                  <AdaptiveImageCard 
                    imagePath={imagePath}
                    postTitle={post.title}
                    onClick={(e) => handleImageClick(e, post)}
                  />

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
              </div>
            )
          })}
        </MasonryGrid>
      </div>
    </div>
  )
}