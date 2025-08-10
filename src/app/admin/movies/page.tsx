'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import Image from 'next/image';
import DefaultMovieImage from '@/components/DefaultMovieImage';

interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  thumb_url: string;
  year: number;
  category: Array<{
    name: string;
    slug: string;
  }>;
  status?: string;
  views?: number;
  rating?: {
    vote_average: number;
    vote_count: number;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  // Fetch movies from API
  const fetchMovies = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24'
      });

      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      const response = await fetch(`/api/movies?${params}`);
      const data = await response.json();

      if (data.success) {
        setMovies(data.data.items);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch movies:', data.message);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [categoryFilter]); // Fetch when filters change

  // Filter movies based on search
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.origin_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || movie.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get unique categories for filter
  const categories = [...new Set(movies.flatMap(movie => movie.category.map(cat => cat.name)))];

  const handleDeleteClick = (movieId: string) => {
    setMovieToDelete(movieId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (movieToDelete) {
      try {
        const response = await fetch(`/api/movies/${movieToDelete}`, {
          method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
          setMovies(movies.filter(movie => movie._id !== movieToDelete));
          setShowDeleteModal(false);
          setMovieToDelete(null);
        } else {
          console.error('Failed to delete movie:', data.message);
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies</h1>
          <p className="text-gray-400 mt-1">
            Total {pagination.totalItems.toLocaleString()} movies in database
          </p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
          <FaPlus />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-700 text-white block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-700 text-white block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-700 text-white block w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="mt-4 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none ${
                viewMode === 'grid'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none ${
                viewMode === 'list'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <div key={movie._id} className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-60">
                {movie.thumb_url ? (
                  <Image
                    src={getImageUrl(movie.thumb_url)}
                    alt={movie.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <DefaultMovieImage 
                    title={movie.name}
                    width={240}
                    height={240}
                    className="w-full h-full"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={movie.status || 'published'} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{movie.name}</h3>
                <div className="flex justify-between text-gray-400 text-sm mb-3">
                  <span>{movie.category[0]?.name || 'Uncategorized'}</span>
                  <span>{movie.year}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mb-4">
                  <span className="flex items-center">
                    <FaEye className="mr-1" />
                    {movie.views?.toLocaleString() || '0'}
                  </span>
                  <span>⭐ {movie.rating?.vote_average.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-md flex items-center justify-center">
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  <button 
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-red-500 py-2 rounded-md flex items-center justify-center"
                    onClick={() => handleDeleteClick(movie._id)}
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-700">
              <thead className="bg-zinc-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Movie</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Views</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {filteredMovies.map(movie => (
                  <tr key={movie._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-12 relative">
                          {movie.thumb_url ? (
                            <Image
                              src={getImageUrl(movie.thumb_url)}
                              alt={movie.name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <DefaultMovieImage 
                              title={movie.name}
                              width={48}
                              height={64}
                              className="rounded"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{movie.name}</div>
                          <div className="text-sm text-gray-400">{movie.origin_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{movie.category[0]?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{movie.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={movie.status || 'published'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {movie.views?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      ⭐ {movie.rating?.vote_average.toFixed(1) || '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-500 hover:text-blue-400 mr-3">
                        <FaEdit />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-400"
                        onClick={() => handleDeleteClick(movie._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => fetchMovies(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-zinc-700 bg-zinc-800 text-sm font-medium ${
                pagination.currentPage === 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-zinc-700'
              }`}
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-zinc-700 bg-zinc-800 text-sm font-medium text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchMovies(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-zinc-700 bg-zinc-800 text-sm font-medium ${
                pagination.currentPage === pagination.totalPages
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-zinc-700'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-white">Delete Movie</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Are you sure you want to delete this movie? All associated data will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-zinc-800 text-base font-medium text-gray-300 hover:bg-zinc-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 