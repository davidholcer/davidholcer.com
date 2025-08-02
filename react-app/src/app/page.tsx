'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Masonry from 'react-masonry-css'
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectCard, ProjectCardGrid } from '@/components/ui/Cards';
import dynamic from 'next/dynamic';

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

export default function HomePage() {
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

  return (
    <div className="w-full text-gray-900 dark:text-white">
      
      {/* Combined Hero and Projects Section */}
      <div className="relative w-full px-4 md:px-12 lg:px-24" data-scroll-section>
        {/* Hero Section */}
        <div className="w-full py-20" data-scroll data-scroll-speed="0.3">
          <div className="text-left">
            <h1 
              className="text-5xl md:text-4xl font-medium mb-2 saans"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Hey, I'm David
            </h1>
            <p 
              className="text-xl md:text-xl mb-1 max-w-3xl saans"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Creating & Coding: Generative Art, Graphic Design, Digital Music
            </p>
            
            {/* Category Filter Buttons */}
            {!loading && (
              <div className="flex flex-wrap gap-3 mt-4 mb-4" data-scroll data-scroll-speed="0.2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
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
          </div>
        </div>

        {/* Projects Grid or Loading */}
        <div className="w-full pb-8" data-scroll data-scroll-speed="0.4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg">Loading projects...</div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <ProjectCardGrid 
              projects={filteredProjects.map(project => ({
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
                No projects found for the selected categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}