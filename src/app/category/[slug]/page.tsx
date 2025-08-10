'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import { FaFilter } from 'react-icons/fa';

interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  thumb_url: string;
  year: number;
  category: Array<{ name: string; slug: string }>;
  lang: string;
  quality: string;
}

interface CategoryResponse {
  success: boolean;
  data: {
    items: Movie[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export default function CategoryPage() {
  const params = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    sort_field: 'modified.time',
    sort_type: 'desc',
    sort_lang: '',
    country: '',
    year: '',
    limit: '24'
  });

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...filters
      });

      const response = await fetch(`/api/movies/category/${params.slug}?${queryParams}`);
      const data: CategoryResponse = await response.json();

      if (data.success) {
        setMovies(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (error) {
      setError('Error fetching movies');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [params.slug, currentPage, filters, fetchMovies]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white capitalize">
          {params.slug.toString().replace(/-/g, ' ')}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md"
        >
          <FaFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-zinc-800 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort_field}
                onChange={(e) => handleFilterChange('sort_field', e.target.value)}
                className="bg-zinc-700 text-white w-full p-2 rounded-md"
              >
                <option value="modified.time">Last Updated</option>
                <option value="_id">ID</option>
                <option value="year">Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sort_type}
                onChange={(e) => handleFilterChange('sort_type', e.target.value)}
                className="bg-zinc-700 text-white w-full p-2 rounded-md"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Language
              </label>
              <select
                value={filters.sort_lang}
                onChange={(e) => handleFilterChange('sort_lang', e.target.value)}
                className="bg-zinc-700 text-white w-full p-2 rounded-md"
              >
                <option value="">All</option>
                <option value="vietsub">Vietsub</option>
                <option value="thuyet-minh">Thuyết Minh</option>
                <option value="long-tieng">Lồng Tiếng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="bg-zinc-700 text-white w-full p-2 rounded-md"
              >
                <option value="">All</option>
                {Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) => (
                  <option key={2024 - i} value={2024 - i}>
                    {2024 - i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="bg-zinc-700 text-white w-full p-2 rounded-md"
              >
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
                <option value="64">64</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map(movie => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 text-white rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-zinc-800 text-white rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-800 text-white rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 