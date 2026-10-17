import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddInitial?: () => void;
  maxStock?: number;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  onAddInitial,
  maxStock = 99,
  size = 'md',
  fullWidth = false,
  disabled = false,
}) => {
  if (disabled || maxStock <= 0) {
    return (
      <button
        disabled
        className="w-full h-8 sm:h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-not-allowed select-none flex items-center justify-center"
      >
        Out of Stock
      </button>
    );
  }

  // If quantity is 0, show the standard grocery "ADD" CTA
  if (quantity === 0) {
    const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAddInitial) onAddInitial();
      else onIncrement();
    };

    const sizeStyles = {
      sm: 'h-8 px-2.5 text-xs font-extrabold',
      md: 'h-9 px-3.5 text-xs font-extrabold tracking-wide',
      lg: 'h-11 px-6 text-sm font-extrabold tracking-wide',
    };

    return (
      <button
        onClick={handleAdd}
        className={`
          ${fullWidth ? 'w-full' : ''}
          ${sizeStyles[size]}
          rounded-lg border border-[#0C831F] bg-[#F0F8F1] text-[#0C831F]
          hover:bg-[#0C831F] hover:text-white
          active:scale-95 transition-all duration-150
          flex items-center justify-center gap-1 shadow-xs select-none
        `}
      >
        <span>ADD</span>
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    );
  }

  // When quantity > 0: Clean [ - ] count [ + ] stepper
  const stepperStyles = {
    sm: {
      container: 'h-8 px-1',
      btn: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'w-6 text-xs font-bold',
    },
    md: {
      container: 'h-9 px-1.5',
      btn: 'w-7 h-7',
      icon: 'w-3.5 h-3.5',
      text: 'w-7 text-sm font-bold',
    },
    lg: {
      container: 'h-11 px-2',
      btn: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'w-9 text-base font-bold',
    },
  };

  const currentSize = stepperStyles[size];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`
        inline-flex items-center justify-between rounded-lg bg-[#0C831F] text-white shadow-xs select-none
        ${currentSize.container}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrement}
        className={`
          ${currentSize.btn}
          flex items-center justify-center rounded-md bg-[#096317] hover:bg-[#074f12] active:scale-90 text-white transition-all
        `}
      >
        <Minus className={`${currentSize.icon} stroke-[2.5]`} />
      </button>

      <span className={`text-center ${currentSize.text} text-white font-bold leading-none`}>
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= maxStock}
        onClick={onIncrement}
        className={`
          ${currentSize.btn}
          flex items-center justify-center rounded-md bg-[#096317] hover:bg-[#074f12] active:scale-90 text-white transition-all
          disabled:opacity-50 disabled:pointer-events-none
        `}
      >
        <Plus className={`${currentSize.icon} stroke-[2.5]`} />
      </button>
    </div>
  );
};
