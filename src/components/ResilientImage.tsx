import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
  aspectClassName?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = 'w-full h-full object-cover',
  aspectClassName = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#08204E] to-[#0B3C8C] text-white p-6 text-center ${aspectClassName} ${className}`}
      >
        <FileText className="w-8 h-8 text-sky-300 mb-2 opacity-80" />
        <span className="text-xs font-semibold tracking-wider uppercase text-sky-200">
          Layitek Blog
        </span>
        <span className="text-sm font-bold mt-1 line-clamp-2 max-w-xs">
          {fallbackLabel || alt || 'Layitek Limited Editorial Guide'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
