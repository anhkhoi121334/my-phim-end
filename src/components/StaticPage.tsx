import { FC, ReactNode } from 'react';

interface StaticPageProps {
  title: string;
  children: ReactNode;
}

const StaticPage: FC<StaticPageProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0d1117]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">{title}</h1>
          <div className="prose prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPage; 