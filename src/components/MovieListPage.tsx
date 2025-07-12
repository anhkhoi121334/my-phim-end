import { useEffect, useState, useCallback } from 'react';
import movieApi, { Movie, Genre, Country } from '@/services/api/movieApi';
import MovieCard from './MovieCard';

interface MovieListPageProps {
  title: string;
  fetchMovies: (
    page: number,
    limit: number,
    sortBy: string,
    genre?: string,
    country?: string,
    year?: number | null
  ) => Promise<{
    status: boolean;
    items: Movie[];
    pagination?: {
      totalPages: number;
      currentPage: number;
      pageSize: number;
      total: number;
    };
  }>;
  showFilters?: boolean;
  showSortOptions?: boolean;
  showPagination?: boolean;
  initialSort?: string;
  initialCountry?: string;
  initialYear?: number | null;
  initialGenre?: string;
  initialPage?: number;
  pageSize?: number;
}

export default function MovieListPage({ 
  title,
  fetchMovies,
  showFilters = true,
  showSortOptions = true,
  showPagination = true,
  initialSort = 'latest',
  initialCountry,
  initialYear,
  initialGenre,
  initialPage = 1,
  pageSize = 24
}: MovieListPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear || null);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [countries, setCountries] = useState<Country[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [years] = useState(() => movieApi.getYears());

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);

        // Fetch countries and genres for filters
        if (showFilters) {
          const [countriesData, genresData] = await Promise.all([
            movieApi.fetchCountries(),
            movieApi.fetchGenres()
          ]);
          setCountries(countriesData);
          setGenres(genresData);
        }

        // Fetch movies with initial parameters
        const response = await fetchMovies(currentPage, pageSize, sortBy, selectedGenre, selectedCountry, selectedYear);

        if (response?.items) {
          setMovies(response.items);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 0);
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      }
    };

    loadInitialData();
  }, [currentPage, fetchMovies, pageSize, selectedCountry, selectedGenre, selectedYear, showFilters, sortBy]);

  // Handle page change
  const handlePageChange = useCallback(async (page: number) => {
    try {
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const response = await fetchMovies(page, pageSize, sortBy, selectedGenre, selectedCountry, selectedYear);

      if (response?.items) {
        setMovies(response.items);
        setCurrentPage(page);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 0);
        }
      }
    } catch (err) {
      console.error('Error changing page:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    }
  }, [fetchMovies, pageSize, sortBy, selectedCountry, selectedYear, selectedGenre]);

  // Handle filter changes
  const handleFilterChange = useCallback(async ({
    newSortBy = sortBy,
    newCountry = selectedCountry,
    newYear = selectedYear,
    newGenre = selectedGenre
  }) => {
    try {
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const response = await fetchMovies(1, pageSize, newSortBy, newGenre, newCountry, newYear);

      if (response?.items) {
        setMovies(response.items);
        setCurrentPage(1);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 0);
        }
        
        // Update state
        setSortBy(newSortBy);
        setSelectedCountry(newCountry);
        setSelectedYear(newYear);
        setSelectedGenre(newGenre);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    }
  }, [fetchMovies, pageSize, sortBy, selectedCountry, selectedYear, selectedGenre]);

  // Render pagination controls
  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          
          {/* Sort options */}
          {showSortOptions && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Sắp xếp:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange({ newSortBy: 'latest' })}
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'latest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => handleFilterChange({ newSortBy: 'popular' })}
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'popular'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Phổ biến
                </button>
                <button
                  onClick={() => handleFilterChange({ newSortBy: 'rating' })}
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'rating'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Đánh giá
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quốc gia
                </label>
                <select
                  value={selectedCountry || ''}
                  onChange={(e) => handleFilterChange({ newCountry: e.target.value || undefined })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tất cả quốc gia</option>
                  {countries.map((country) => (
                    <option key={country.slug} value={country.slug}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm
                </label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => handleFilterChange({ newYear: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tất cả các năm</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thể loại
                </label>
                <select
                  value={selectedGenre || ''}
                  onChange={(e) => handleFilterChange({ newGenre: e.target.value || undefined })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tất cả thể loại</option>
                  {genres.map((genre) => (
                    <option key={genre.slug} value={genre.slug}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Movies grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy phim</h3>
            <p className="text-gray-600">Vui lòng thử lại với bộ lọc khác</p>
          </div>
        )}

        {/* Pagination */}
        {movies.length > 0 && renderPagination()}
      </div>
    </div>
  );
} 