'use client';

import { useEffect } from 'react';
import GenresGrid from '@/components/GenresGrid';

export default function GenresPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <GenresGrid />
    </div>
  );
} 