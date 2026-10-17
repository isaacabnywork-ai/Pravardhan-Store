import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
  };

  const variantStyles = {
    primary: 'bg-[#0C831F] hover:bg-[#096317] text-white font-bold shadow-xs focus:ring-[#0C831F]',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-[#1C1C1C] font-semibold focus:ring-gray-300',
    accent: 'bg-[#F8B602] hover:bg-[#E5A700] text-[#1C1C1C] font-bold shadow-xs focus:ring-[#F8B602]',
    outline: 'border border-[#0C831F] text-[#0C831F] font-bold hover:bg-[#F0F8F1] focus:ring-[#0C831F]',
    ghost: 'text-[#1C1C1C] font-semibold hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
