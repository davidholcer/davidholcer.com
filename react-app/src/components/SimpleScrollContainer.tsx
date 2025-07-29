"use client";

import { ReactNode } from 'react';

interface SimpleScrollContainerProps {
  children: ReactNode;
}

export default function SimpleScrollContainer({ children }: SimpleScrollContainerProps) {
  return (
    <div className="min-h-screen overflow-y-auto">
      {children}
    </div>
  );
} 