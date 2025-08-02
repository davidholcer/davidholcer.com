'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectCardGrid } from '@/components/ui/Cards';
import dynamic from 'next/dynamic';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Chip } from '@heroui/react';

interface Project {
  slug: string;
  metadata: {
    title: string;
    date: string;
    description: string;
    image: string;
    categories: string;
  };
  links: {
    blog?: string;
    site?: string;
    code?: string;
    game?: string;
    extension?: string;
    sheet?: string;
    itch?: string;
  };
}

const categories = [
  "All",
  "P5js",
  "2D",
  "3D",
  "Python",
  "Processing",
  "Graphic Design",
  "Frontend",
  "Backend",
  "Research",
  "Data Science",
  "Artificial Intelligence"
]

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // Handle hash scrolling on page load
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = initialScrollTo || window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            // Add offset to account for fixed navigation
            const offset = 150;
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
      } else {
        const attrTheme = document.documentElement.getAttribute('data-theme');
        if (attrTheme === 'dark' || attrTheme === 'light') setTheme(attrTheme);
      }
    };
    
    getTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
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
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.metadata.date);
        const month = projectDate.getMonth() + 1; // getMonth() returns 0-11
        return month.toString() === selectedMonth;
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
    setSelectedMonth('all');
    setDateRange('all');
    setSelectedYears([]);
  };

  return (
    <div className="w-full text-gray-900 dark:text-white pt-32">
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-24" data-scroll-section>
        <div className="text-center max-w-4xl mx-auto">
          <h1 
            className="text-6xl md:text-7xl font-medium mb-6 saans"
            style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            Hey, I'm David
          </h1>
          <p 
            className="text-2xl md:text-3xl mb-8 max-w-3xl mx-auto saans"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Creating & Coding: Generative Art, Graphic Design, Digital Music
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
            >
              View Projects
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center px-4 md:px-12 lg:px-24 py-20" data-scroll-section>
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-1/3">
              <div 
                className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}
              >
                <Image
                  src="/assets/images/david.JPG"
                  alt="David Holcer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="w-full lg:w-2/3">
              <h2 className="text-4xl font-medium mb-8 saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                About Me
              </h2>
              <p className="text-xl mb-8" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                Hey! 👋 I'm David Holcer, a recent graduate from McGill University in Montreal, QC with a B.Sc. in Mathematics and Computer Science. I am interested in the world of data science, generative art, and front-end development. I'm constantly looking for new technologies to learn and implement within my personal projects.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-medium mb-4 saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                    📍 Current Endeavors
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen px-4 md:px-12 lg:px-24 py-20" data-scroll-section>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium mb-6 saans" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              My Projects
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
                    className="px-6 py-3 rounded-full text-sm font-medium border transition-all duration-200"
                    style={{
                      backgroundColor: selectedCategories.includes(category)
                        ? (theme === 'dark' ? '#ffffff' : '#000000')
                        : (theme === 'dark' ? '#334155' : '#ffffff'),
                      color: selectedCategories.includes(category)
                        ? (theme === 'dark' ? '#000000' : '#ffffff')
                        : (theme === 'dark' ? '#d1d5db' : '#374151'),
                      borderColor: selectedCategories.includes(category)
                        ? (theme === 'dark' ? '#ffffff' : '#000000')
                        : (theme === 'dark' ? '#475569' : '#d1d5db')
                    }}
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
                  links: project.links,
                  slug: project.slug
                }))}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-gray-600 dark:text-gray-400">
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