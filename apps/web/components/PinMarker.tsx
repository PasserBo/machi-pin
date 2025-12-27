import type { PinColor } from '@repo/types';

/**
 * Pin color to CSS color mapping
 */
const PIN_COLOR_MAP: Record<PinColor, string> = {
  red: '#ef4444',    // red-500
  blue: '#3b82f6',   // blue-500
  yellow: '#facc15', // yellow-400
};

interface PinMarkerProps {
  /** Pin color */
  color: PinColor;
  /** Optional click handler */
  onClick?: () => void;
  /** Whether the pin is selected */
  isSelected?: boolean;
}

/**
 * PinMarker - A styled map pin with shadow for 3D effect
 * The visual anchor point (pin tip) is at the bottom center of the component
 */
export default function PinMarker({
  color,
  onClick,
  isSelected = false,
}: PinMarkerProps) {
  const pinColor = PIN_COLOR_MAP[color];

  return (
    <div
      className={`
        relative cursor-pointer
        transition-transform duration-150 ease-out
        hover:scale-110 hover:-translate-y-0.5
        ${isSelected ? 'scale-110 -translate-y-0.5' : ''}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {/* Shadow - positioned at the bottom, behind the pin */}
      <div
        className="absolute -bottom-1 left-1/2 w-5 h-2 rounded-full opacity-40"
        style={{
          backgroundColor: '#000',
          transform: 'translateX(-50%)',
          filter: 'blur(3px)',
        }}
      />
      
      {/* Pin Icon SVG */}
      <svg
        viewBox="0 0 24 30"
        fill="none"
        className="w-7 h-8 drop-shadow-md"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))' }}
      >
        {/* Pin body - teardrop shape */}
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z"
          fill={pinColor}
        />
        {/* Inner circle - white dot */}
        <circle
          cx="12"
          cy="11"
          r="4"
          fill="white"
          fillOpacity="0.9"
        />
        {/* Highlight - subtle shine effect */}
        <ellipse
          cx="8"
          cy="7"
          rx="2"
          ry="1.5"
          fill="white"
          fillOpacity="0.4"
        />
      </svg>

      {/* Selection ring */}
      {isSelected && (
        <div
          className="absolute -inset-1 rounded-full border-2 animate-pulse"
          style={{ borderColor: pinColor }}
        />
      )}
    </div>
  );
}

