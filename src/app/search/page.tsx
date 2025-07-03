'use client';

import { useState } from 'react';
import useSearch from '@/hooks/useSearch';
import MovieCard from '@/components/MovieCard';

export default function SearchPage() {
  const {
    searchInput,
    results,
    isLoading,
    error,
    currentPage,
    totalPages,
    searchHistory,
    handleInputChange,
    handleSubmit,
    handlePageChange,
    handleHistoryItemClick,
    clearHistory,
    removeFromHistory,
  } = useSearch();
  
  // State to control history dropdown
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen mt-[70px] page-transition">
      <h1 className="text-3xl font-bold mb-6">Tìm kiếm phim</h1>
      
      <div className="mb-10 relative">
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput || ''}
                onChange={handleInputChange}
                onFocus={() => Array.isArray(searchHistory) && searchHistory.length > 0 && setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                placeholder="Nhập tên phim, diễn viên..."
                className="w-full px-5 py-3 rounded-l-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search history dropdown */}
              {showHistory && Array.isArray(searchHistory) && searchHistory.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-b-md shadow-lg mt-1">
                  <div className="flex justify-between items-center p-3 border-b border-gray-700">
                    <span className="text-gray-400 text-sm">Lịch sử tìm kiếm</span>
                    <button
                      onClick={() => clearHistory && clearHistory()}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <ul>
                    {searchHistory.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => item && handleHistoryItemClick(item)}
                      >
                        <span>{item}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item && removeFromHistory && removeFromHistory(item);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center my-20">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => handlePageChange(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      ) : !Array.isArray(results) || results.length === 0 ? (
        <div className="text-center my-20">
          <div className="text-xl mb-4">
            {searchInput
              ? 'Không tìm thấy kết quả nào cho từ khóa này.'
              : 'Nhập từ khóa để tìm kiếm phim.'}
          </div>
          {searchInput && (
            <div className="text-gray-400">
              Hãy thử với từ khóa khác hoặc xem các phim đề xuất bên dưới.
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Kết quả tìm kiếm cho &ldquo;{searchInput}&rdquo;
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((movie) => movie && (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                >
                  Trước
                </button>
                
                <div className="px-4 py-2 rounded bg-blue-600 text-white">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 