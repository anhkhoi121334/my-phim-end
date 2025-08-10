export default function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="bg-gray-800 rounded aspect-[2/3]"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}