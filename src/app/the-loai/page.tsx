'use client';

import { useEffect } from 'react';
import GenresGrid from '@/components/GenresGrid';

export default function GenresPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#0a0e1a] min-h-screen">
      <GenresGrid />
    </div>
  );
} 