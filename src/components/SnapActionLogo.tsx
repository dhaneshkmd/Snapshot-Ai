import React from 'react';

interface SnapActionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'icon-only' | 'horizontal' | 'stacked';
  className?: string;
  showGlow?: boolean;
}

export const SnapActionLogo: React.FC<SnapActionLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = '',
  showGlow = false,
}) => {
  // Dimension resolver
  const getIconPixelSize = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 20;
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 56;
      case 'xl':
        return 88;
      case '2xl':
        return 120;
      default:
        return 40;
    }
  };

  const iconPx = getIconPixelSize();

  // The standalone vector icon (Viewfinder + Gradient Lightning Flash)
  const renderIconMark = () => (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        showGlow ? 'filter drop-shadow-[0_4px_16px_rgba(37,99,235,0.35)]' : ''
      }`}
      style={{ width: iconPx, height: iconPx }}
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Viewfinder Brackets Gradients */}
          <linearGradient id="snap_vf_tl" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="snap_vf_tr" x1="160" y1="40" x2="120" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="snap_vf_bl" x1="40" y1="160" x2="80" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="snap_vf_br" x1="160" y1="160" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Lightning Upper Facet: Warm Golden Yellow to Fiery Orange */}
          <linearGradient id="snap_bolt_top" x1="116" y1="56" x2="85" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFCC00" />
            <stop offset="45%" stopColor="#FF8800" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>

          {/* Lightning Lower Facet: Red-Orange to Electric Magenta & Violet */}
          <linearGradient id="snap_bolt_bottom" x1="130" y1="104" x2="90" y2="162" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="30%" stopColor="#F43F5E" />
            <stop offset="75%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Ambient Inner Glow Filter */}
          <filter id="snap_inner_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.25" />
            <feComposite in2="shadowDiff" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* 1. Viewfinder 4 Rounded Corner Brackets */}
        {/* Top-Left Bracket */}
        <path
          d="M 58 40 L 76 40 C 81 40 85 44 85 49 C 85 54 81 58 76 58 L 58 58 C 48 58 40 66 40 76 L 40 94 C 40 99 36 103 31 103 C 26 103 22 99 22 94 L 22 76 C 22 56 38 40 58 40 Z"
          fill="url(#snap_vf_tl)"
        />

        {/* Top-Right Bracket */}
        <path
          d="M 142 40 L 124 40 C 119 40 115 44 115 49 C 115 54 119 58 124 58 L 142 58 C 152 58 160 66 160 76 L 160 94 C 160 99 164 103 169 103 C 174 103 178 99 178 94 L 178 76 C 178 56 162 40 142 40 Z"
          fill="url(#snap_vf_tr)"
        />

        {/* Bottom-Left Bracket */}
        <path
          d="M 58 160 L 76 160 C 81 160 85 156 85 151 C 85 146 81 142 76 142 L 58 142 C 48 142 40 134 40 124 L 40 106 C 40 101 36 97 31 97 C 26 97 22 101 22 106 L 22 124 C 22 144 38 160 58 160 Z"
          fill="url(#snap_vf_bl)"
        />

        {/* Bottom-Right Bracket */}
        <path
          d="M 142 160 L 124 160 C 119 160 115 156 115 151 C 115 146 119 142 124 142 L 142 142 C 152 142 160 134 160 124 L 160 106 C 160 101 164 97 169 97 C 174 97 178 101 178 106 L 178 124 C 178 144 162 160 142 160 Z"
          fill="url(#snap_vf_br)"
        />

        {/* 2. Dynamic 3D Lightning Bolt Symbol in Center */}
        {/* Upper Facet (Golden Yellow to Fiery Orange) */}
        <path
          d="M 115 56 C 117 56 119 58 118 60 L 75 116 C 73 118 75 121 78 121 L 110 121 C 112 121 113 120 114 119 L 132 100 C 134 98 133 95 130 95 L 108 95 L 115 56 Z"
          fill="url(#snap_bolt_top)"
        />

        {/* Lower Facet (Fiery Orange to Electric Magenta & Violet) */}
        <path
          d="M 130 98 C 132 98 133 100 132 102 L 91 160 C 89 163 86 160 87 157 L 97 112 C 98 109 96 106 93 106 L 76 106 C 74 106 73 104 74 102 L 88 84 C 90 82 93 83 93 85 L 89 104 L 130 98 Z"
          fill="url(#snap_bolt_bottom)"
        />

        {/* Polished Seamless Lightning Solid Core for Crispness */}
        <path
          d="M 115 56 L 75 116 C 73 118 75 121 78 121 L 104 121 L 90 160 C 89 163 92 165 94 162 L 133 104 C 135 101 133 98 130 98 L 105 98 L 115 56 Z"
          fill="url(#snap_bolt_top)"
          opacity="0.95"
        />

        {/* Layered Lower Tail Gradient Overlay */}
        <path
          d="M 104 121 L 90 160 C 89 163 92 165 94 162 L 133 104 L 110 104 L 104 121 Z"
          fill="url(#snap_bolt_bottom)"
        />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderIconMark()}</div>;
  }

  // Wordmark typography featuring signature violet 'n'
  const renderWordmark = (textSizeClass: string, subtextClass?: string) => (
    <div className="flex flex-col select-none">
      <div className={`font-black tracking-tight leading-none flex items-center ${textSizeClass}`}>
        <span className="text-slate-900 dark:text-white">SnapActio</span>
        {/* The signature vibrant violet/indigo gradient letter 'n' from the official logo */}
        <span className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
          n
        </span>
        <span className="text-slate-900 dark:text-white ml-1.5">AI</span>
      </div>
      {subtextClass && (
        <span className={`text-slate-500 dark:text-slate-400 font-medium ${subtextClass}`}>
          Screenshot Intelligence
        </span>
      )}
    </div>
  );

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        {renderIconMark()}
        {renderWordmark(
          iconPx >= 80 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
          iconPx >= 80 ? 'text-xs sm:text-sm tracking-wider uppercase mt-1' : undefined
        )}
      </div>
    );
  }

  // Default: horizontal variant (Header / inline)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderIconMark()}
      {renderWordmark(
        iconPx <= 32 ? 'text-lg tracking-tight' : 'text-xl sm:text-2xl tracking-tight'
      )}
    </div>
  );
};
