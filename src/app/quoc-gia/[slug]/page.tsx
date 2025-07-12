"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MovieListPage from '@/components/MovieListPage';
import movieApi from '@/services/api/movieApi';

export default function CountryPage() {
  const { slug } = useParams();
  const [countryName, setCountryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountryName = async () => {
      try {
        setError(null);
        const countries = await movieApi.fetchCountries();
        const country = countries.find(c => c.slug === slug);
        if (country) {
          setCountryName(country.name);
        } else {
          setError('Không tìm thấy quốc gia này');
        }
      } catch (err) {
        console.error('Error fetching country:', err);
        setError('Đã xảy ra lỗi khi tải thông tin quốc gia');
      }
    };

    if (slug) {
      fetchCountryName();
    }
  }, [slug]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
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
      </div>
    );
  }

  return (
    <MovieListPage
      title={`Phim ${countryName || 'Đang tải...'}`}
      fetchMovies={async (page, limit, sortBy) => {
        try {
          const response = await movieApi.fetchMoviesByCountry(
            slug as string,
            page,
            limit,
            sortBy
          );
          // Transform the response to match the expected type
          return {
            status: response.status,
            items: response.items,
            pagination: response.pagination ? {
              totalPages: response.pagination.totalPages,
              currentPage: response.pagination.currentPage,
              pageSize: limit, // Add missing pageSize
              total: response.pagination.totalPages * limit // Add missing total
            } : undefined
          };
        } catch (error) {
          console.error('Error fetching movies:', error);
          // Ensure a compatible object is returned even on error, or re-throw
           throw error;
        }
      }}
    />
  );
}