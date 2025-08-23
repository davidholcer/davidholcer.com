"use client";

import React from 'react';

interface VideoProps {
  src: string;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  className?: string;
}

export const Video: React.FC<VideoProps> = ({
  src,
  width = "100%",
  height = "auto",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  poster,
  className = ""
}) => {
  return (
    <div 
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        margin: '1.5rem 0',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <video
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        poster={poster}
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
