export default function BannerSkeleton() {
  return (
    <div className="w-full h-[60vh] bg-gray-800 animate-pulse">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="w-1/2">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}