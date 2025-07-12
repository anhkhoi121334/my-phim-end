"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import movieApi, { Country } from '@/services/api/movieApi';

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setError(null);
        const data = await movieApi.fetchCountries();
        setCountries(data);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Đã xảy ra lỗi khi tải danh sách quốc gia. Vui lòng thử lại sau.');
      }
    };

    fetchCountries();
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Danh sách quốc gia</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {countries.map((country) => (
          <Link
            key={country._id}
            href={`/quoc-gia/${country.slug}`}
            className="block p-4 rounded-lg bg-white shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              {country.name}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
} 