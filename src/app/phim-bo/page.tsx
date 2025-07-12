"use client";
import MovieListPage from '@/components/MovieListPage';
import movieApi from '@/services/api/movieApi';

export default function TVSeriesPage() {
  // Create a wrapper function to match the required data type
  const fetchTVSeriesWrapper = async (
    page: number,
    limit: number,
    sortBy: string,
    genre?: string,
    country?: string,
    year?: number | null
  ) => {
    // Call the original API function
    const response = await movieApi.fetchTVSeries(page, limit, sortBy, genre, country, year);
    
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
      title="Phim Bộ"
      fetchMovies={fetchTVSeriesWrapper} // Pass the new wrapper function
    />
  );
}