"use client";

import { FC } from "react";
import Image from "next/image";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  color?: "red" | "white" | "gray";
  fullscreen?: boolean;
  className?: string;
  showLogo?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const colorMap = {
  red: "#ef4444",
  white: "#fff",
  gray: "#9ca3af",
};

const Loading: FC<LoadingProps> = ({
  size = "md",
  color = "red",
  fullscreen = false,
  className = "",
  showLogo = false,
}) => {
  const spinnerSize = sizeMap[size] || 48;
  const spinnerColor = colorMap[color] || colorMap.red;

  const containerClasses = fullscreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    : "flex flex-col items-center justify-center";

  return (
    <div className={`${containerClasses} ${className}`}>
      {showLogo && (
        <div className="relative w-32 h-32 mb-6 animate-fade-in">
          <Image
            src="/myphim-logo.svg"
            alt="MyPhim Logo"
            fill
            className="object-contain opacity-90"
            priority
          />
        </div>
      )}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: spinnerSize }}
      >
        <svg
          className="animate-spin"
          width={spinnerSize}
          height={spinnerSize}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-20"
            cx="25"
            cy="25"
            r="20"
            stroke={spinnerColor}
            strokeWidth="6"
          />
          <path
            d="M45 25c0-11.046-8.954-20-20-20"
            stroke={spinnerColor}
            strokeWidth="6"
            strokeLinecap="round"
            className="animate-dash"
          />
        </svg>
      </div>
      <style jsx global>{`
        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
        .animate-dash {
          animation: dash 1.2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loading; 