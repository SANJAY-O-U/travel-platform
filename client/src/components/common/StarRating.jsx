// ============================================================
// StarRating Component
// ============================================================
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 14, showValue = false, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative">
              <Star
                size={size}
                className="text-slate-700"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
                >
                  <Star size={size} className="text-sand" fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-sand ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}