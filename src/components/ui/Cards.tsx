import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { MasonryGrid } from './MasonryGrid';
import MobileSketchRedirect from '@/components/MobileSketchRedirect';

interface Project {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  date: string;
  categories: string[];
  glowColor?: string;
  links?: {
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

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const Chip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span
    className={
      `inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ` +
      // light
      `bg-gray-100 text-gray-700 ring-1 ring-black/5 shadow-sm ` +
      // dark improved contrast similar to CTA
      `dark:bg-slate-800/80 dark:text-slate-200 dark:ring-1 dark:ring-white/10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] ` +
      `transition-colors ${className}`
    }
  >
    {children}
  </span>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  
  // Construct the proper image path
  const getImagePath = (imageSrc: string) => {
    if (!imageSrc) return '';
    // If it's already a full path, return as is
    if (imageSrc.startsWith('/')) return imageSrc;
    // Otherwise, prepend the assets/images path
    return `/assets/images/${imageSrc}`;
  };
  
  const imagePath = getImagePath(project.image);
  const imageDimensions = useImageDimensions(imagePath);
  
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasSketch) {
      // Trigger mobile redirect
      setShouldRedirect(true);
      return;
    }
    
    // Default behavior for desktop or works without sketches
    if (project.slug) {
      window.location.href = `/works/${project.slug}`;
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  // Calculate aspect ratio based on image dimensions
  const aspectRatio = imageDimensions?.aspectRatio || 4/3;
  const aspectRatioStyle = { aspectRatio: aspectRatio };
  
  // Get glow color from project metadata or use default
  const glowColor = project.glowColor || '#3b82f6'; // Default blue glow

  // Check if the work has a JS script by looking for known sketch works
  const sketchWorkSlugs = [
    'moving_points', '3d_egg', 'circles_color', 'noisy_dots',
    'spheres', 'tesla_ball', 'trillipses', 'vector_field',
    'leveled_circles'
  ];
  
  // Check if this project has a sketch
  const hasSketch = sketchWorkSlugs.includes(project.slug!);

  return (
    <div 
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      
      {shouldRedirect && hasSketch && (
        <MobileSketchRedirect slug={project.slug!} />
      )}
      {/* Standalone Image Card - Clickable */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-slate-800 shadow-lg cursor-pointer group"
        style={{
          ...aspectRatioStyle,
          transition: 'box-shadow 0.3s ease-out'
        }}
        onClick={handleImageClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}60, 0 0 60px ${glowColor}40, 0 0 0 2px ${glowColor}80`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <Image
          src={imagePath}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            filter: `drop-shadow(0 0 10px ${glowColor}40)`,
            transition: 'filter 0.3s ease-out',
            borderRadius: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = `drop-shadow(0 0 25px ${glowColor}90) brightness(1.1)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = `drop-shadow(0 0 10px ${glowColor}40)`;
          }}
        />
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}60, inset 0 0 20px ${glowColor}20`,
            borderRadius: '1rem',
            zIndex: 1
          }}
        />
        {/* Overlay to indicate clickability */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
            Click to view
          </div>
        </div>
      </div>

      {/* Separate Text Content Group */}
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-xl font-medium leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        
        {/* Date */}
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {project.date}
        </p>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-200 leading-relaxed line-clamp-3">
          {project.description}
        </p>
        
        {/* Categories */}
        {project.categories && project.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.categories.slice(0, 3).map((category, index) => (
              <Chip key={index} className="gap-1">
                {category}
              </Chip>
            ))}
          </div>
        )}
        
        {/* Links */}
        {project.links && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.links.blog && (
              <Link
                href={project.links.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Blog
              </Link>
            )}
            {project.links.site && (
              <Link
                href={project.links.site}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Site
              </Link>
            )}
            {project.links.site2 && (
              <Link
                href={project.links.site2}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Site
              </Link>
            )}
            {project.links.code && (
              <Link
                href={project.links.code}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Code
              </Link>
            )}
            {project.links.game && (
              <Link
                href={project.links.game}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Game
              </Link>
            )}
            {project.links.extension && (
              <Link
                href={project.links.extension}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Extension
              </Link>
            )}
            {project.links.sheet && (
              <Link
                href={project.links.sheet}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Sheet
              </Link>
            )}
            {project.links.itch && (
              <Link
                href={project.links.itch}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Itch
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ProjectCardGridProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export const ProjectCardGrid: React.FC<ProjectCardGridProps> = ({ projects, onProjectClick }) => {
  return (
    <MasonryGrid columns={3} gap={48} className="w-full">
      {projects.map((project, index) => (
        <div key={project.id || project.slug || index} className="mb-24">
          <ProjectCard
            project={project}
            onClick={() => onProjectClick?.(project)}
          />
        </div>
      ))}
    </MasonryGrid>
  );
};

export default ProjectCard;
