import React from 'react';

interface PriceDisplayProps {
  price: number;
  mrp?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  discountPercent,
  size = 'md',
  showSavings = false,
  className = '',
}) => {
  const hasDiscount = mrp && mrp > price;
  const calcDiscount = discountPercent || (hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const savings = hasDiscount ? mrp - price : 0;

  const sizeClasses = {
    sm: {
      price: 'text-xs sm:text-sm font-bold text-[#1C1C1C]',
      mrp: 'text-[11px] text-[#888888]',
      discount: 'text-[9px] px-1 py-0.2',
    },
    md: {
      price: 'text-sm sm:text-base font-extrabold text-[#1C1C1C]',
      mrp: 'text-xs text-[#888888]',
      discount: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      price: 'text-lg sm:text-xl font-extrabold text-[#1C1C1C]',
      mrp: 'text-xs sm:text-sm text-[#888888]',
      discount: 'text-xs px-2 py-0.5',
    },
    xl: {
      price: 'text-2xl lg:text-3xl font-extrabold text-[#1C1C1C]',
      mrp: 'text-sm sm:text-base text-[#888888]',
      discount: 'text-xs font-bold px-2 py-0.5',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`${currentSize.price} tracking-tight leading-none`}>
          ₹{price.toLocaleString('en-IN')}
        </span>

        {hasDiscount && (
          <span className={`${currentSize.mrp} line-through decoration-[#999999] leading-none`}>
            ₹{mrp.toLocaleString('en-IN')}
          </span>
        )}

        {calcDiscount > 0 && (
          <span className={`font-extrabold rounded bg-[#FFF7E6] text-[#B45309] border border-[#FDE68A] uppercase tracking-wider leading-none ${currentSize.discount}`}>
            {calcDiscount}% OFF
          </span>
        )}
      </div>

      {showSavings && savings > 0 && (
        <span className="text-[10px] font-semibold text-[#0C831F] mt-0.5">
          Save ₹{savings.toLocaleString('en-IN')}
        </span>
      )}
    </div>
  );
};
