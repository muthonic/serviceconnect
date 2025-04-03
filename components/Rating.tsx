'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export default function Rating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showCount = false,
  count = 0,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(null)}
            className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            aria-label={`Rate ${star} stars`}
          >
            <FaStar
              className={`${sizeClasses[size]} ${
                star <= (hover ?? value)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="ml-2 text-sm text-gray-500">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
} 