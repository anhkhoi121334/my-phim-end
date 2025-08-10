import Link from 'next/link';

interface SectionHeadingProps {
  title: string;
  href?: string;
}

export default function SectionHeading({ title, href }: SectionHeadingProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-red-600 before:rounded-full">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all flex items-center group"
        >
          Xem tất cả
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
} 