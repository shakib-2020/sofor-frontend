import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md mb-4 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-start">
          <div className="h-6 bg-gray-200 rounded mb-2 w-32"></div>
          <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded mb-2 w-16"></div>
            <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="h-6 bg-gray-200 rounded mb-2 w-20"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

