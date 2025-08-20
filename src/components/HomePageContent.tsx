'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectCardGrid } from '@/components/ui/Cards';
import dynamic from 'next/dynamic';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Chip } from '@heroui/react';
import { TypeAnimation } from 'react-type-animation';
import P5Sketch from './P5Sketch';

interface Project {
  slug: string;
  metadata: {
    title: string;
    date: string;
    description: string;
    image: string;
    categories: string;
    glowColor?: string;
  };
  links: {
    blog?: string;
    site?: string;
    site2?: string;
    code?: string;
    game?: string;
    extension?: string;
    sheet?: string;
    itch?: string;
  };
}

// Categories will be auto-generated from projects

interface HomePageContentProps {
  initialScrollTo?: string;
}

export default function HomePageContent({ initialScrollTo }: HomePageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const urlFilter = searchParams.get('filter');
  const initialFilters = urlFilter
    ? urlFilter.split(',').map(f => f.trim()).filter(Boolean)
    : ['All'];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Debug theme changes
  useEffect(() => {
    console.log('HomePageContent: Theme changed to:', theme);
  }, [theme]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1920, height: 1080 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get all unique categories from projects
  const categories = React.useMemo(() => {
    const categorySet = new Set<string>();
    categorySet.add('All');
    projects.forEach(project => {
      if (project.metadata.categories) {
        project.metadata.categories.split(',').forEach(cat => {
          categorySet.add(cat.trim());
        });
      }
    });
    return Array.from(categorySet);
  }, [projects]);

  // Get all unique years from projects
  const availableYears = React.useMemo(() => {
    const yearSet = new Set<string>();
    projects.forEach(project => {
      if (project.metadata.date) {
        const year = new Date(project.metadata.date).getFullYear().toString();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
  }, [projects]);

  // Handle hash scrolling on page load
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = initialScrollTo || window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            // Add offset to account for fixed navigation
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    };

    // Wait for page to load before scrolling
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleHashScroll);
    } else {
      handleHashScroll();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleHashScroll);
    };
  }, [initialScrollTo]);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategories.length === 0 || selectedCategories.includes('All')) {
      params.delete('filter');
    } else {
      params.set('filter', selectedCategories.join(','));
    }
    router.replace('?' + params.toString(), { scroll: false });
  }, [selectedCategories]);

  // Update filters if URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    const filters = urlFilter
      ? urlFilter.split(',').map(f => f.trim()).filter(Boolean)
      : ['All'];
    setSelectedCategories(filters);
  }, [searchParams]);

  useEffect(() => {
    const getTheme = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        // Ensure data-theme attribute is set
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const attrTheme = document.documentElement.getAttribute('data-theme');
        if (attrTheme === 'dark' || attrTheme === 'light') {
          setTheme(attrTheme);
        } else {
          // Check time-based theme preference (like moving_points.js logic)
          const currentHour = new Date().getHours();
          const timeBasedTheme = currentHour >= 18 || currentHour < 6 ? 'dark' : 'light';
          
          // Set the theme based on time and save it
          setTheme(timeBasedTheme);
          document.documentElement.setAttribute('data-theme', timeBasedTheme);
          localStorage.setItem('theme', timeBasedTheme);
        }
      }
    };
    
    getTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    // Listen for localStorage changes (when theme is toggled)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark');
      }
    };
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Filter logic: show projects if any selected category matches
  const filteredProjects = selectedCategories.includes('All')
    ? projects
    : projects.filter(project =>
        project.metadata.categories.split(',').some(cat =>
          selectedCategories.some(sel => sel.toLowerCase() === cat.trim().toLowerCase())
        )
      );

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

  // Date filtering and sorting logic
  const getFilteredAndSortedProjects = () => {
    let filtered = filteredProjects;

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
      
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.metadata.date);
        return projectDate >= cutoffDate;
      });
    }

    // Apply month filter
    if (selectedMonth.length > 0) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.metadata.date);
        const month = projectDate.getMonth() + 1; // getMonth() returns 0-11
        return selectedMonth.includes(month.toString());
      });
    }

    // Apply year filter
    if (selectedYears.length > 0) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.metadata.date);
        const year = projectDate.getFullYear().toString();
        return selectedYears.includes(year);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.metadata.date);
      const dateB = new Date(b.metadata.date);
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

  return (
    <div className="w-full text-gray-900 dark:text-white -pt-20">
      
      {/* Hero Section with Background Animation */}
      <section className="relative min-h-screen flex items-center justify-center" data-scroll-section>
        {/* Background P5 Sketch */}
        <div 
          className="fixed z-0 sketch-position-responsive" 
          style={{ 
            top: '70px', 
            width: '100vw', 
            height: 'calc(100vh - 70px)'
          }}
        >
          <P5Sketch 
            key={`sketch-${theme}`}
            sketchPath="/assets/sketches/moving_points.js"
            width={windowDimensions.width}
            height={windowDimensions.height - 70}
            className="w-full h-full"
            theme={theme}
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 md:px-12 lg:px-24">
          {/* Glassmorphism overlay for text readability */}
          <div 
            className="absolute top-0 left-0 right-0 -m-8 rounded-2xl backdrop-blur-md-hero"
            style={{
              backgroundColor: theme === 'dark' 
                ? 'rgba(0, 0, 0, 0.15)' 
                : 'rgba(255, 255, 255, 0.0)',
              border: `1px solid ${theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.15)'
                : '0 8px 32px rgba(0, 0, 0, 0.05)',
              top: '-3rem',
              bottom: '-3rem'
            }}
          />
          
          {/* Text content with relative positioning */}
          <div className="relative z-10">
            <h1 
              className="text-6xl md:text-7xl font-medium mb-6 montreal"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Hey, I'm David
            </h1>
            <p 
              className="text-2xl md:text-3xl mb-8 max-w-3xl mx-auto montreal"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              <TypeAnimation
                sequence={[
                  'Creating & Coding: Generative Art',
                  3000,
                  'Creating & Coding: Graphic Design',
                  1500,
                  'Creating & Coding: Digital Music',
                  1000,
                ]}
                wrapper="span"
                speed={30}
                repeat={3}
              />
            </p>
            <p 
              className="text-lg md:text-xl mb-12 max-w-2xl mx-auto"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              A recent graduate from McGill University with a passion for data science, generative art, and front-end development.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#about"
                className="px-8 py-4 rounded-full text-lg font-medium border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                  color: theme === 'dark' ? '#000000' : '#ffffff',
                  borderColor: theme === 'dark' ? '#ffffff' : '#000000'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('about');
                  if (element) {
                    const offset = 120; // Offset to position section higher
                    const elementPosition = element.offsetTop - offset;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                Learn More
              </a>
              <a 
                href="#projects"
                className="px-8 py-4 rounded-full text-lg font-medium border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#ffffff' : '#000000'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('projects');
                  if (element) {
                    const offset = 120; // Offset to position section higher
                    const elementPosition = element.offsetTop - offset;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                View Projects
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center px-4 md:px-12 lg:px-24 py-32" data-scroll-section>
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-1/3">
              <div 
                className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}
              >
                <Image
                  src="/assets/images/pfp-2.jpg"
                  alt="David Holcer"
                  width={800}
                  height={1200}
                  className="object-cover w-full h-auto"
                  priority
                />
              </div>
            </div>
            <div className="w-full lg:w-2/3">
              <h2 className="text-4xl font-medium mb-8 montreal" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                About Me
              </h2>
              <p className="text-xl mb-8" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                Hey! 👋 I'm David Holcer, a recent graduate from McGill University in Montreal, QC with a B.Sc. in Mathematics and Computer Science. I am interested in the world of data science, generative art, and front-end development. I'm constantly looking for new technologies to learn and implement within my personal projects.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-medium mb-4 montreal" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    📍 Current Endeavors
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium montreal" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        🤖 Data Science & AI
                      </h4>
                      <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        As a Data Science Researcher, I innovated next-gen techniques around social media bot creation and detection. I'm dedicated to exploring the impact of artificial intelligence in both applied and experimental contexts.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        🎨 Generative Art & Design
                      </h4>
                      <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        I love creating art through code. Teaching p5.js workshops and sharing interactive visualizations has been incredibly fulfilling—I get to blend creativity with math and tech, showing people just how expressive we can be with code.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                        👨‍💻 Software Development
                      </h4>
                      <p style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        I've developed sentiment analysis tools, playlist cover art generators, and interactive storytelling platforms, all powered by advanced APIs and my coding expertise.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Download Resume Button */}
                <div className="pt-8">
                  <a 
                    href="/assets/pdf/David_Holcer.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 rounded-full text-lg font-medium border-2 transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                      color: theme === 'dark' ? '#000000' : '#ffffff',
                      borderColor: theme === 'dark' ? '#ffffff' : '#000000'
                    }}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen px-4 md:px-12 lg:px-24 py-32" data-scroll-section>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium mb-6 montreal flex items-center justify-center" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              My Projects
              <span className="inline-flex items-center ml-4 px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full ring-1 ring-blue-400/30 dark:ring-white/10 shadow-sm">
                {projects.length}
              </span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              Explore my work in generative art, data science, and web development
            </p>
            
            {/* Category Filter Buttons */}
            {!loading && (
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {categories.map((category) => (
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
            {!loading && (
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

          {/* Projects Grid or Loading */}
          <div className="w-full">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg">Loading projects...</div>
              </div>
            ) : getFilteredAndSortedProjects().length > 0 ? (
              <ProjectCardGrid 
                projects={getFilteredAndSortedProjects().map(project => ({
                  title: project.metadata.title,
                  description: project.metadata.description,
                  image: project.metadata.image,
                  categories: project.metadata.categories.split(',').map(cat => cat.trim()),
                  date: project.metadata.date,
                  glowColor: project.metadata.glowColor,
                  links: {
                    ...project.links,
                    site2: project.links.site2
                  },
                  slug: project.slug
                }))}
              />
            ) : (
              <div className="text-center py-20">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
          No projects found for the selected filters.
        </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 