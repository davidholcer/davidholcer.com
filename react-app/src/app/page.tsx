'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Masonry from 'react-masonry-css'
import { useRouter, useSearchParams } from 'next/navigation';

interface Project {
  title: string
  categories: string[]
  image: string
  description: string
  date: string
  links: {
    blog?: string
    site?: string
    code?: string
    game?: string
    extension?: string
    sheet?: string
    itch?: string
  }
}

const projects: Project[] = [
  {
    title: "Deco",
    categories: ["data science", "ai"],
    image: "/assets/images/deco.png",
    description: "AI-powered interior design assistant that helps you visualize and plan your space.",
    date: "2023-10-26",
    links: {
      site: "/works/deco",
      code: "https://github.com/yourusername/deco"
    }
  },
  {
    title: "Creative Coding Workshop 2025",
    categories: ["p5js", "frontend"],
    image: "/assets/images/chenghuai_workshop.jpg",
    description: "Interactive workshop teaching creative coding through p5.js and generative art.",
    date: "2023-10-26",
    links: {
      site: "https://www.chenghuai.org/project/creative-coding-workshop",
      code: "https://github.com/yourusername/creative-coding-workshop"
    }
  },
  {
    title: "Stitch",
    categories: ["frontend", "backend"],
    image: "/assets/images/stitch.png",
    description: "Collaborative platform for digital artists to create and share their work.",
    date: "2023-10-26",
    links: {
      site: "/works/stitch",
      code: "https://github.com/yourusername/stitch"
    }
  },
  {
    title: "Bot or Not",
    categories: ["research"],
    image: "/assets/images/botornot.png",
    description: "Research project analyzing and detecting AI-generated content.",
    date: "2023-10-26",
    links: {
      blog: "/blog/botornot",
      code: "https://github.com/yourusername/botornot"
    }
  },
  {
    title: "Writemind",
    categories: ["frontend", "backend"],
    image: "/assets/images/writemind.png",
    description: "AI-powered writing assistant that helps you organize and develop your ideas.",
    date: "2023-10-26",
    links: {
      site: "/works/writemind",
      code: "https://github.com/yourusername/writemind"
    }
  },
  {
    title: "Coverify",
    categories: ["frontend", "backend"],
    image: "/assets/images/coverify.png",
    description: "A web app to generate custom Spotify playlist covers using AI.",
    date: "2023-10-26",
    links: {
      blog: "/blog/coverify",
      site: "https://coverify.ai",
      code: "https://github.com/d-holcer/coverify"
    }
  },
  {
    title: "StoryWeaver",
    categories: ["frontend", "ai"],
    image: "/assets/images/storyweaver.png",
    description: "An interactive storytelling platform powered by AI.",
    date: "2023-08-20",
    links: {
      blog: "/blog/storyweaver",
      site: "https://storyweaver.ai"
    }
  },
  {
    title: "Chaotic Colored Shapes",
    categories: ["p5js", "2d", "generative art"],
    image: "/assets/images/ccs.png",
    description: "A generative art piece that creates chaotic patterns with colored shapes.",
    date: "2023-09-15",
    links: {
      blog: "/blog/ccs",
      site: "https://example.com/ccs"
    }
  },
  {
    title: "Vector Field",
    categories: ["p5js", "2D"],
    image: "/assets/images/vector_field.jpg",
    description: "Generative art project exploring vector fields and their visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/vector-field",
      code: "https://github.com/yourusername/vector-field"
    }
  },
  {
    title: "Moving Points",
    categories: ["p5js", "2D"],
    image: "/assets/images/moving_points.jpg",
    description: "Generative art project exploring movement and point patterns.",
    date: "2023-10-26",
    links: {
      site: "/works/moving-points",
      code: "https://github.com/yourusername/moving-points"
    }
  },
  {
    title: "Noisy Dots",
    categories: ["p5js", "2D"],
    image: "/assets/images/noisy_dots.jpg",
    description: "Generative art project exploring noise and dot patterns.",
    date: "2023-10-26",
    links: {
      site: "/works/noisy-dots",
      code: "https://github.com/yourusername/noisy-dots"
    }
  },
  {
    title: "Spheres",
    categories: ["p5js", "3D"],
    image: "/assets/images/spheres.jpg",
    description: "Generative art project exploring 3D spheres and their visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/spheres",
      code: "https://github.com/yourusername/spheres"
    }
  },
  {
    title: "Leveled Circles",
    categories: ["p5js", "2D"],
    image: "/assets/images/leveled_circles.jpg",
    description: "Generative art project exploring leveled circles and their visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/leveled-circles",
      code: "https://github.com/yourusername/leveled-circles"
    }
  },
  {
    title: "Trillipses",
    categories: ["p5js", "2D"],
    image: "/assets/images/trillipses.jpg",
    description: "Generative art project exploring trillipses and their visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/trillipses",
      code: "https://github.com/yourusername/trillipses"
    }
  },
  {
    title: "Tesla Ball",
    categories: ["p5js", "2D"],
    image: "/assets/images/tesla_ball.jpg",
    description: "Generative art project exploring the Tesla ball and its visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/tesla-ball",
      code: "https://github.com/yourusername/tesla-ball"
    }
  },
  {
    title: "3D Egg",
    categories: ["p5js", "3D"],
    image: "/assets/images/3d_egg.jpg",
    description: "Generative art project exploring the 3D egg and its visual representations.",
    date: "2023-10-26",
    links: {
      site: "/works/3d-egg",
      code: "https://github.com/yourusername/3d-egg"
    }
  },
  {
    title: "Mapping Earthquakes",
    categories: ["processing", "2D"],
    image: "/assets/images/earthquakes.jpg",
    description: "Data visualization project mapping earthquake data.",
    date: "2023-10-26",
    links: {
      site: "/works/earthquakes",
      code: "https://github.com/yourusername/earthquakes"
    }
  },
  {
    title: "Food Safety Infographic",
    categories: ["adobe illustrator", "2D"],
    image: "/assets/images/food_safety.jpg",
    description: "Infographic project illustrating food safety guidelines.",
    date: "2023-10-26",
    links: {
      site: "/works/food-safety",
      code: "https://github.com/yourusername/food-safety"
    }
  },
  {
    title: "SWC Times",
    categories: ["adobe illustrator", "2D"],
    image: "/assets/images/swc_times.jpg",
    description: "Infographic project illustrating SWC times.",
    date: "2023-10-26",
    links: {
      site: "/works/swc-times",
      code: "https://github.com/yourusername/swc-times"
    }
  },
  {
    title: "Chess Lines",
    categories: ["python", "pygame"],
    image: "/assets/images/chess_lines.jpg",
    description: "Python project implementing a chess game using pygame.",
    date: "2023-10-26",
    links: {
      site: "/works/chess-lines",
      code: "https://github.com/yourusername/chess-lines"
    }
  },
  {
    title: "All The News Sentiment Analysis",
    categories: ["python", "ai"],
    image: "/assets/images/sentiment_analysis.jpg",
    description: "Python project analyzing sentiment in news articles.",
    date: "2023-10-26",
    links: {
      site: "/works/sentiment-analysis",
      code: "https://github.com/yourusername/sentiment-analysis"
    }
  },
  {
    title: "Kleiber's Law",
    categories: ["research"],
    image: "/assets/images/kleiber.jpg",
    description: "Research project analyzing Kleiber's Law.",
    date: "2023-10-26",
    links: {
      site: "/works/kleiber",
      code: "https://github.com/yourusername/kleiber"
    }
  },
  {
    title: "Nonlinear Optimization",
    categories: ["research"],
    image: "/assets/images/optimization.jpg",
    description: "Research project exploring nonlinear optimization techniques.",
    date: "2023-10-26",
    links: {
      site: "/works/optimization",
      code: "https://github.com/yourusername/optimization"
    }
  },
  {
    title: "Markov Chains",
    categories: ["research"],
    image: "/assets/images/markov.jpg",
    description: "Research project exploring Markov chains and their applications.",
    date: "2023-05-10",
    links: {
      site: "/works/markov",
      code: "https://github.com/yourusername/markov"
    }
  }
]

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

  const sortedProjects = projects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter logic: show projects if any selected category matches
  const filteredProjects = selectedCategories.includes('All')
    ? sortedProjects
    : sortedProjects.filter(project =>
        project.categories.some(cat =>
          selectedCategories.some(sel => sel.toLowerCase() === cat.toLowerCase())
        )
      );

  useEffect(() => {
    window.dispatchEvent(new Event('locomotive-update'));
  }, [filteredProjects]);

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
        <div className="w-full py-20" data-scroll data-scroll-speed="0.5">
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
            <div className="flex flex-wrap gap-3 mt-4 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
                  style={{
                    backgroundColor: selectedCategories.includes(category)
                      ? (theme === 'dark' ? '#ffffff' : '#000000')
                      : (theme === 'dark' ? '#1f2937' : '#ffffff'),
                    color: selectedCategories.includes(category)
                      ? (theme === 'dark' ? '#000000' : '#ffffff')
                      : (theme === 'dark' ? '#d1d5db' : '#374151'),
                    borderColor: selectedCategories.includes(category)
                      ? (theme === 'dark' ? '#ffffff' : '#000000')
                      : (theme === 'dark' ? '#4b5563' : '#d1d5db')
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="w-full pb-8">
          <Masonry
            breakpointCols={{ default: 3, 1024: 3, 900: 2, 640: 1 }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {filteredProjects.map((project, index) => (
              <div
                key={project.title}
                data-scroll
                data-scroll-speed={0.1 + (index * 0.05)}
                className="flex flex-col mb-8"
              >
                <div className="relative group overflow-hidden shadow-lg">
                  <Link href={project.links.blog || project.links.site || '#'} className="block">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      onLoad={() => window.dispatchEvent(new Event('locomotive-update'))}
                      onError={() => window.dispatchEvent(new Event('locomotive-update'))}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center text-center p-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-xl font-medium text-white">{project.title}</h3>
                        <p className="text-sm text-gray-200 mt-2">{project.description}</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Content below image */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.categories.map((category, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm mt-2">
                    {project.links.blog && (
                      <Link 
                        href={project.links.blog}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Blog
                      </Link>
                    )}
                    {project.links.site && (
                      <Link 
                        href={project.links.site}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Site
                      </Link>
                    )}
                    {project.links.code && (
                      <Link 
                        href={project.links.code}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Code
                      </Link>
                    )}
                    {project.links.game && (
                      <Link 
                        href={project.links.game}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Game
                      </Link>
                    )}
                    {project.links.extension && (
                      <Link 
                        href={project.links.extension}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Extension
                      </Link>
                    )}
                    {project.links.sheet && (
                      <Link 
                        href={project.links.sheet}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Sheet
                      </Link>
                    )}
                    {project.links.itch && (
                      <Link 
                        href={project.links.itch}
                        className="font-medium transition-colors"
                        style={{
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151';
                        }}
                      >
                        Itch
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  )
}