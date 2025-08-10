"use client";
import MovieListPage from '@/components/MovieListPage';
import { useAnime } from '@/hooks';
import movieApi from '@/services/api/movieApi';
import Loading from '@/components/Loading';

export default function LatestMoviesPage() {
  // Lấy dữ liệu anime
  const { isLoading: isLoadingAnime } = useAnime(50);

  // Create a wrapper function to transform the API response
  const getLatestMoviesWrapper = async (
    page: number,
    limit: number,
    sortBy: string,
    genre?: string,
    country?: string,
    year?: number | null
  ) => {
    // Call the original API function
    const response = await movieApi.getLatestMovies(page, limit, sortBy, genre, country, year);
    
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

  if (isLoadingAnime) {
    return <Loading fullscreen={false} showLogo={false} />;
  }

  return (
    <div>
      {/* Kho Tàng Anime */}
  
      
      {/* Danh sách phim mới */}
      <MovieListPage
        title="Phim Mới"
        fetchMovies={getLatestMoviesWrapper} // Use the new wrapper function
      />
    </div>
  );
}