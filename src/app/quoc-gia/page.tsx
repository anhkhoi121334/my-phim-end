"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import movieApi from '@/services/api/movieApi';

interface Country {
  id: string;
  name: string;
  slug: string;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await movieApi.fetchCountries();
        setCountries(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải danh sách quốc gia:', err);
        setError('Đã xảy ra lỗi khi tải danh sách quốc gia. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Country icons mapping
  const countryIcons: Record<string, string> = {
    'viet-nam': '🇻🇳',
    'trung-quoc': '🇨🇳',
    'han-quoc': '🇰🇷',
    'nhat-ban': '🇯🇵',
    'thai-lan': '🇹🇭',
    'au-my': '🇺🇸',
    'hong-kong': '🇭🇰',
    'dai-loan': '🇹🇼',
    'an-do': '🇮🇳',
    'philippines': '🇵🇭',
    'malaysia': '🇲🇾',
    'indonesia': '🇮🇩',
    'singapore': '🇸🇬',
    'anh': '🇬🇧',
    'phap': '🇫🇷',
    'canada': '🇨🇦',
    'duc': '🇩🇪',
    'tay-ban-nha': '🇪🇸',
    'uc': '🇦🇺',
    'y': '🇮🇹',
    'nga': '🇷🇺',
    'khac': '🌍',
  };

  // Get icon for a country
  const getCountryIcon = (slug: string) => {
    return countryIcons[slug] || '🌍';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Đang tải...
            </span>
          </div>
          <p className="mt-4 text-lg">Đang tải danh sách quốc gia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xl mb-4">{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">Phim Theo Quốc Gia</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {countries.map((country) => (
          <Link 
            href={`/quoc-gia/${country.slug}`} 
            key={country.id || country.slug}
            className="country-card bg-[#1a1c2a] hover:bg-[#242736] transition-all duration-300 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <div className="p-5 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3" aria-hidden="true">{getCountryIcon(country.slug)}</span>
              <h2 className="text-lg font-semibold text-white">{country.name}</h2>
              <p className="text-sm text-gray-400 mt-1">Phim {country.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
} 