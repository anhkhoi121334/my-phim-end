import React from 'react';
import Image from 'next/image';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-4">
        <Image 
          src="/myphim-icon.svg"
          alt="MyPhim Logo"
          fill
          className="animate-pulse"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default Loading; 