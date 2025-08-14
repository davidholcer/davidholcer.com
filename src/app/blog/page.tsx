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
  categories?: string
  links?: {
    blog?: string;
    site?: string;
    site2?: string;
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // Get all unique categories from posts
  const allCategories = React.useMemo(() => {
    const categories = new Set<string>();
    categories.add('All');
    posts.forEach(post => {
      if (post.categories) {
        post.categories.split(',').forEach(cat => {
          categories.add(cat.trim());
        });
      }
    });
    return Array.from(categories);
  }, [posts]);

  // Get all unique years from posts
  const availableYears = React.useMemo(() => {
    const yearSet = new Set<string>();
    posts.forEach(post => {
      if (post.date) {
        const year = new Date(post.date).getFullYear().toString();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
  }, [posts]);

  // Toggle filter
  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      setSelectedCategories(prev => {
        const next = prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev.filter(c => c !== 'All'), category];
        return next.length === 0 ? ['All'] : next;
      });
    }
  };

  // Filter and sort posts
  const getFilteredAndSortedPosts = () => {
    let filtered = posts;

    // Apply category filter
    if (!selectedCategories.includes('All')) {
      filtered = filtered.filter(post =>
        post.categories && post.categories.split(',').some(cat =>
          selectedCategories.some(sel => sel.toLowerCase() === cat.trim().toLowerCase())
        )
      );
    }

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
    if (selectedMonth.length > 0) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.date);
        const month = postDate.getMonth() + 1; // getMonth() returns 0-11
        return selectedMonth.includes(month.toString());
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
    setSelectedCategories(['All']);
    setSortOrder('newest');
    setSelectedMonth([]);
    setDateRange('all');
    setSelectedYears([]);
  };

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
    // Navigate to the internal blog page
    window.location.href = `/blog/${post.slug}`;
  };

  return (
    <div className="w-full">
      <div className="relative w-full px-4 md:px-12 lg:px-24 py-20" style={{ paddingTop: '8rem' }}>
                  <div className="text-center mb-16">
            <h2 className="text-4xl font-medium mb-6 montreal flex items-center justify-center" style={{ color: 'var(--text-color)' }}>
              My Blog Posts
              <span className="inline-flex items-center ml-4 px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full ring-1 ring-blue-400/30 dark:ring-white/10 shadow-sm">
                {posts.length}
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Explore my thoughts on technology, design, and development
            </p>
          
          {/* Category Filter Buttons */}
          {posts.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-medium border transition-all duration-200 ${
                    selectedCategories.includes(category) 
                      ? 'filter-button-active' 
                      : 'filter-button'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Date Filter Controls */}
          {posts.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {/* Sort Order */}
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered" 
                    className="filter-button"
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
                    className="filter-button"
                  >
                    Month: {selectedMonth.length === 0 ? 'All Months' : 
                      selectedMonth.length === 1 ? `Month ${selectedMonth[0]}` : 
                      `${selectedMonth.length} Months`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Month filter"
                  selectionMode="multiple"
                  selectedKeys={selectedMonth}
                  onSelectionChange={(keys) => setSelectedMonth(Array.from(keys) as string[])}
                  className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2"
                >
                  <DropdownItem key="1" className="text-center">{selectedMonth.includes('1') ? '✓ January' : 'January'}</DropdownItem>
                  <DropdownItem key="2" className="text-center">{selectedMonth.includes('2') ? '✓ February' : 'February'}</DropdownItem>
                  <DropdownItem key="3" className="text-center">{selectedMonth.includes('3') ? '✓ March' : 'March'}</DropdownItem>
                  <DropdownItem key="4" className="text-center">{selectedMonth.includes('4') ? '✓ April' : 'April'}</DropdownItem>
                  <DropdownItem key="5" className="text-center">{selectedMonth.includes('5') ? '✓ May' : 'May'}</DropdownItem>
                  <DropdownItem key="6" className="text-center">{selectedMonth.includes('6') ? '✓ June' : 'June'}</DropdownItem>
                  <DropdownItem key="7" className="text-center">{selectedMonth.includes('7') ? '✓ July' : 'July'}</DropdownItem>
                  <DropdownItem key="8" className="text-center">{selectedMonth.includes('8') ? '✓ August' : 'August'}</DropdownItem>
                  <DropdownItem key="9" className="text-center">{selectedMonth.includes('9') ? '✓ September' : 'September'}</DropdownItem>
                  <DropdownItem key="10" className="text-center">{selectedMonth.includes('10') ? '✓ October' : 'October'}</DropdownItem>
                  <DropdownItem key="11" className="text-center">{selectedMonth.includes('11') ? '✓ November' : 'November'}</DropdownItem>
                  <DropdownItem key="12" className="text-center">{selectedMonth.includes('12') ? '✓ December' : 'December'}</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Year Filter */}
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered" 
                    className="filter-button"
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
                  {availableYears.map((year) => (
                    <DropdownItem key={year} className="text-center">
                      {selectedYears.includes(year) ? `✓ ${year}` : year}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {/* Date Range Filter */}
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered" 
                    className="filter-button"
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
          )}
        </div>

        <MasonryGrid columns={3} gap={48} className="w-full">
          {getFilteredAndSortedPosts().map((post) => {
            // Debug: Log each post's image
            console.log(`Post "${post.title}" image:`, post.image)
            
            // Ensure image path is properly formatted
            const getImagePath = (imageSrc: string | null) => {
              if (!imageSrc) return null;
              // If it's already a full path, return as is
              if (imageSrc.startsWith('/')) return imageSrc;
              // Otherwise, prepend the assets/images path
              return `/assets/images/${imageSrc}`;
            };
            
            const imagePath = getImagePath(post.image || null);
            
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
                    <h2 className="text-xl font-medium leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    
                    {/* Date */}
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      {post.date}
                    </p>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed line-clamp-3">
                      {post.description || 'Click to read more...'}
                    </p>
                    
                    {/* Categories */}
                    {post.categories && (
                      <div className="flex flex-wrap gap-1">
                        {post.categories.split(',').map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-full ring-1 ring-gray-300/50 dark:ring-white/10 shadow-sm dark:shadow-lg"
                          >
                            {category.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Links */}
                    {post.links && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.links.blog && (
                          <Link
                            href={post.links.blog}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/25 rounded-full ring-1 ring-blue-400/20 dark:ring-white/10 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/35 transition-colors"
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
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/25 rounded-full ring-1 ring-green-400/20 dark:ring-white/10 shadow-sm hover:bg-green-100 dark:hover:bg-green-900/35 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Site
                          </Link>
                        )}
                        {post.links.site2 && (
                          <Link
                            href={post.links.site2}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/25 rounded-full ring-1 ring-green-400/20 dark:ring-white/10 shadow-sm hover:bg-green-100 dark:hover:bg-green-900/35 transition-colors"
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
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/25 rounded-full ring-1 ring-purple-400/20 dark:ring-white/10 shadow-sm hover:bg-purple-100 dark:hover:bg-purple-900/35 transition-colors"
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