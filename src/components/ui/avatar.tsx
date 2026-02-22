import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = { sm: 32, md: 40, lg: 56, xl: 80 };
const sizeClasses = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14', xl: 'h-20 w-20' };

export function Avatar({ src, alt = 'User', size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={sizeMap[size]}
        height={sizeMap[size]}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`flex items-center justify-center rounded-full bg-red-700 font-semibold text-white ${sizeClasses[size]} ${className}`}>
      <span className={size === 'sm' ? 'text-xs' : size === 'xl' ? 'text-xl' : 'text-sm'}>
        {initials}
      </span>
    </div>
  );
}
