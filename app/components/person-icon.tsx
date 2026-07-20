export function PersonIcon({
  size,
  strokeWidth,
  opacity,
  className,
}: {
  size: number;
  strokeWidth: number;
  opacity: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" opacity={opacity} />
    </svg>
  );
}
