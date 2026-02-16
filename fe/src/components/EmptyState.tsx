import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  message: string;
  illustration?: LucideIcon;
  iconSize?: number;
  className?: string;
}

export function EmptyState({
  message,
  illustration: Illustration,
  iconSize = 64,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      {Illustration ? (
        <div className="mb-8">
          <Illustration
            size={iconSize}
            className="text-white/60"
            strokeWidth={1.5}
          />
        </div>
      ) : null}
      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
        {message}
      </h3>
      <p className="text-white/60 text-center max-w-md text-lg">
        Start by adding your first customer to get started
      </p>
    </div>
  );
}
