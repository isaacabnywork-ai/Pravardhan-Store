import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-4 shadow-soft">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1F2937] tracking-tight">{title}</h3>
      <p className="text-sm text-[#6B7280] mt-1.5 mb-6 max-w-xs">{description}</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
        {actionText && onAction && (
          <Button onClick={onAction} variant="primary" size="md">
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="secondary" size="md">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
