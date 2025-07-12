"use client";
import MovieListPage from '@/components/MovieListPage';
import movieApi from '@/services/api/movieApi';

export default function AnimationMoviesPage() {
  // Create a wrapper function to match the data type required by MovieListPage
  const fetchAnimationMoviesWrapper = async (
    page: number,
    limit: number,
    sortBy: string,
    genre?: string,
    country?: string,
    year?: number | null
  ) => {
    // Call the original API function
    const response = await movieApi.fetchAnimationMovies(page, limit, sortBy, genre, country, year);
    
    // Return a new object with the corrected pagination structure
    return {
      status: response.status,
      items: response.items,
      pagination: response.pagination ? {
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.currentPage,
        pageSize: limit, // Add the missing 'pageSize'
        total: response.pagination.totalPages * limit // Estimate the missing 'total'
      } : undefined
    };
  };
  
  return (
    <MovieListPage
      title="Phim Hoạt Hình"
      fetchMovies={fetchAnimationMoviesWrapper} // Pass the new wrapper function
    />
  );
}