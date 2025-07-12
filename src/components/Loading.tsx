import { FC } from "react";
import Image from "next/image";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  color?: "red" | "white" | "gray";
  fullscreen?: boolean;
  className?: string;
  showLogo?: boolean;
}

const Loading: FC<LoadingProps> = ({ 
  size = "md", 
  color = "red",
  fullscreen = false,
  className = "",
  showLogo = false
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const colorClasses = {
    red: "bg-red-500",
    white: "bg-white",
    gray: "bg-gray-400"
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50" 
    : "flex flex-col items-center justify-center";

  return (
    <div className={`${containerClasses} ${className}`}>
      {showLogo && (
        <div className="relative w-48 h-48 mb-8">
          <Image
            src="/myphim-logo.svg"
            alt="MyPhim Logo"
            fill
            className="object-contain animate-pulse"
          />
        </div>
      )}
      
      <div className="relative">
        {/* Pulse ring effect */}
        <div className={`absolute inset-0 ${colorClasses[color]} opacity-20 rounded-full animate-ping`}></div>
        
        {/* Bouncing dots */}
        <div className="flex gap-2 relative z-10">
          <div className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} animate-bounce [animation-delay:-0.3s]`}></div>
          <div className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} animate-bounce [animation-delay:-0.15s]`}></div>
          <div className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} animate-bounce`}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading; 