/**
 * Shared loading spinner. Use size/variant to match context.
 */
export default function LoadingSpinner({ size = 'md', variant = 'default' }) {
  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-12 w-12';
  const borderClass = variant === 'white' ? 'border-white' : 'border-primary-600';
  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClass} ${borderClass}`}
      aria-hidden="true"
    />
  );
}
