import React from "react";

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({
  count = 3,
  height = "h-12",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-[#1a1a1a] rounded-lg animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-500">{icon}</div>}
      <p className="text-lg font-medium text-white mb-2">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-6">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-lg transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
