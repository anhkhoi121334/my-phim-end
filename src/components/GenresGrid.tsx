import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchGenres, Genre } from '@/services/api/movieApi';

// Icons for different genres (you can customize these based on genre names)
const genreIcons: Record<string, React.ReactNode> = {
  // Default icon for any genre
  default: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  // Action genre
  "hành động": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  // Romance genre
  "tình cảm": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  // Comedy genre
  "hài hước": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  // Horror genre
  "kinh dị": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  // Adventure genre
  "phiêu lưu": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  // Sci-fi genre
  "viễn tưởng": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  // Animation genre
  "hoạt hình": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  // War genre
  "chiến tranh": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  // Drama genre
  "tâm lý": (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

// Function to get the icon based on genre name
const getGenreIcon = (genreName: string) => {
  const lowerCaseName = genreName.toLowerCase();
  
  // Try to find a match in our icons dictionary
  for (const [key, icon] of Object.entries(genreIcons)) {
    if (lowerCaseName.includes(key)) {
      return icon;
    }
  }
  
  // Return default icon if no match found
  return genreIcons.default;
};

// Function to generate a gradient color based on genre name
const getGenreGradient = (genreName: string): string => {
  const lowerCaseName = genreName.toLowerCase();
  
  // Map specific genres to specific gradients
  if (lowerCaseName.includes("hành động")) {
    return "from-red-600 to-red-900";
  } else if (lowerCaseName.includes("tình cảm")) {
    return "from-pink-500 to-purple-700";
  } else if (lowerCaseName.includes("hài")) {
    return "from-yellow-400 to-orange-600";
  } else if (lowerCaseName.includes("kinh dị")) {
    return "from-gray-800 to-gray-900";
  } else if (lowerCaseName.includes("viễn tưởng")) {
    return "from-indigo-500 to-blue-800";
  } else if (lowerCaseName.includes("hoạt hình")) {
    return "from-green-400 to-cyan-600";
  } else if (lowerCaseName.includes("chiến tranh")) {
    return "from-stone-600 to-stone-900";
  }
  
  // Default gradient for other genres
  return "from-blue-600 to-blue-900";
};

const GenresGrid = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGenres = async () => {
      setLoading(true);
      try {
        const genreData = await fetchGenres();
        setGenres(genreData);
        setError(null);
      } catch (err) {
        console.error('Failed to load genres:', err);
        setError('Không thể tải danh sách thể loại. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadGenres();
  }, []);

  return (
    <div className="bg-[#0a0e1a] py-12 page-transition">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center">
          <span className="inline-block w-1.5 h-8 bg-blue-500 rounded-full mr-3"></span>
          Thể Loại Phim
        </h1>
        
        <p className="text-gray-300 mb-8 max-w-2xl">
          Khám phá bộ sưu tập phim đa dạng của chúng tôi theo nhiều thể loại khác nhau. Từ phim hành động gay cấn đến những bộ phim tình cảm lãng mạn, bạn chắc chắn sẽ tìm thấy thể loại phim yêu thích.
        </p>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-gray-300">Đang tải danh sách thể loại...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-900/50">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-300 mb-4 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-blue-900/30"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {genres.map((genre) => {
              const gradientClass = getGenreGradient(genre.name);
              
              return (
                <Link 
                  key={genre._id} 
                  href={`/the-loai/${genre.slug}`}
                  className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  
                  {/* Card content with subtle hover effects */}
                  <div className="relative z-10 p-5 h-32 flex flex-col items-center justify-center text-center">
                    <div className="text-white mb-3 transform transition-transform duration-300 group-hover:scale-110">
                      {getGenreIcon(genre.name)}
                    </div>
                    <h3 className="text-white text-lg font-bold group-hover:text-white/90 transition-colors">
                      {genre.name}
                    </h3>
                  </div>
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenresGrid; 