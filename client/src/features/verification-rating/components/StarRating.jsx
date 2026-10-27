import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  value = 0,
  onChange,
  maxStars = 5,
  size = 'md',
  readOnly = false,
  showScore = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const currentSize = starSizes[size] || starSizes.md;

  const handleClick = (starIndex) => {
    if (!readOnly && onChange) {
      onChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (!readOnly) {
      setHoverValue(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = activeValue >= starNumber;
          const isHalf = !isFilled && activeValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(starNumber)}
              onMouseEnter={() => handleMouseEnter(starNumber)}
              onMouseLeave={handleMouseLeave}
              className={`p-0.5 transition-colors focus:outline-none ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
};
