interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={index === lines - 1 ? { width: '75%', ...style } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              className="h-12 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="40%" height={16} />
      <Skeleton variant="rectangular" height={200} />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <Skeleton variant="text" width="40%" height={14} className="mb-1" />
      <Skeleton variant="text" width="60%" height={32} />
    </div>
  );
}

export function SkeletonUserRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-6 py-4">
        <Skeleton variant="text" width={120} height={20} />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="text" width={180} height={20} />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="rectangular" width={120} height={32} className="rounded-lg" />
      </td>
    </tr>
  );
}

