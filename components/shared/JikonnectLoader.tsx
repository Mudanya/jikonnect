interface JiKonnectLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function JiKonnectLoader({
  size = "md",
  className = "",
}: JiKonnectLoaderProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer rotating circle */}
      <div
        className="absolute inset-0 rounded-full border-4 border-blue-600 animate-spin"
        style={{
          borderTopColor: "transparent",
          animationDuration: "1.5s",
        }}
      />

      {/* Inner content container */}
      <div className="absolute inset-2 flex items-center justify-center">
        {/* Ji symbol with connection dots */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* The "J" shape - slanted to the right to match logo */}
          <path
            d="M 45 15 L 55 50 Q 58 65, 45 68 Q 38 70, 35 65"
            fill="none"
            stroke="#1E40AF"
            strokeWidth="9"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDuration: "2s" }}
          />

          {/* Connection node (center of network) */}
          <circle
            cx="65"
            cy="28"
            r="7"
            fill="#1E40AF"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.2s" }}
          />
          <circle
            cx="65"
            cy="28"
            r="4.5"
            fill="#FCD34D"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.2s" }}
          />

          {/* Connection lines - network effect */}
          <line
            x1="65"
            y1="28"
            x2="65"
            y2="12"
            stroke="#1E40AF"
            strokeWidth="2.5"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.4s" }}
          />
          <line
            x1="65"
            y1="28"
            x2="77"
            y2="20"
            stroke="#1E40AF"
            strokeWidth="2.5"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.6s" }}
          />
          <line
            x1="65"
            y1="28"
            x2="80"
            y2="30"
            stroke="#1E40AF"
            strokeWidth="2.5"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.8s" }}
          />

          {/* Connection dots */}
          <circle
            cx="65"
            cy="12"
            r="3.5"
            fill="#FCD34D"
            className="animate-bounce"
            style={{ animationDuration: "1s", animationDelay: "0.1s" }}
          />
          <circle
            cx="77"
            cy="20"
            r="3.5"
            fill="#FCD34D"
            className="animate-bounce"
            style={{ animationDuration: "1s", animationDelay: "0.2s" }}
          />
          <circle
            cx="80"
            cy="30"
            r="3.5"
            fill="#FCD34D"
            className="animate-bounce"
            style={{ animationDuration: "1s", animationDelay: "0.3s" }}
          />

          {/* Triangle accent at bottom */}
          <polygon
            points="60,75 50,87 70,87"
            fill="#FCD34D"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "1s" }}
          />
        </svg>
      </div>

      {/* Pulsing background circle */}
      <div
        className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-ping"
        style={{ animationDuration: "2s" }}
      />
    </div>
  );
}
