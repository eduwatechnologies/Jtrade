import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "sidebar";
}

export function Logo({
  className,
  showText = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  // Icon Box colors
  const iconBoxClasses =
    variant === "sidebar"
      ? "bg-sidebar-primary text-sidebar-primary-foreground" // Gold box, Dark text
      : "bg-primary text-primary-foreground"; // Green box, White text

  // Text colors
  const textClasses =
    variant === "sidebar"
      ? "text-sidebar-foreground" // White text
      : "text-primary"; // Green text

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg overflow-hidden shadow-sm",
          sizeClasses[size],
          iconBoxClasses
        )}
      >
        {/* Golden Accent Circle/Glow - Only for default variant (since sidebar variant is already gold) */}
        {variant === "default" && (
          <div className="absolute -top-1 -right-1 w-1/2 h-1/2 bg-[var(--accent)] rounded-full opacity-50 blur-[2px]" />
        )}

        {/* Logo Icon: Stylized J with upward trend */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 relative z-10"
        >
          {/* J shape turning into arrow */}
          <path d="M7 7v7a4 4 0 0 0 8 0V4" />
          <path d="M11 8l4-4 4 4" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight",
              textSizeClasses[size],
              textClasses
            )}
          >
            JTrade
          </span>
        </div>
      )}
    </div>
  );
}
