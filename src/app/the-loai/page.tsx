'use client';

import { useEffect } from 'react';
import GenresGrid from '@/components/GenresGrid';

export default function GenresPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <GenresGrid />
    </div>
  );
} 