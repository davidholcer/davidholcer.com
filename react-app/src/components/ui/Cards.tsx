import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import { MasonryGrid } from './MasonryGrid';

interface Project {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  date: string;
  categories: string[];
  links?: {
    blog?: string;
    site?: string;
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
  <span className={`inline-block px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full ${className}`}>
    {children}
  </span>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const imageDimensions = useImageDimensions(project.image);
  
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prioritize site link, then blog, then code
    const targetUrl = project.links?.site || project.links?.blog || project.links?.code;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  // Calculate aspect ratio based on image dimensions
  const aspectRatio = imageDimensions?.aspectRatio || 4/3;
  const aspectRatioStyle = { aspectRatio: aspectRatio };

  return (
    <div 
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Standalone Image Card - Clickable */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-slate-800 shadow-lg cursor-pointer"
        style={aspectRatioStyle}
        onClick={handleImageClick}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay to indicate clickability */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
            Click to visit
          </div>
        </div>
      </div>

      {/* Separate Text Content Group */}
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        
        {/* Date */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {project.date}
        </p>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-white leading-relaxed line-clamp-3">
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
