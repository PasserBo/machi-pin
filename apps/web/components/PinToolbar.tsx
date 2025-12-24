import { useState } from 'react';
import type { PinColor } from '@repo/types';

/**
 * Pin color configuration
 */
const PIN_COLORS: { color: PinColor; bgClass: string; shadowClass: string; label: string }[] = [
  {
    color: 'red',
    bgClass: 'bg-red-500',
    shadowClass: 'shadow-red-500/40',
    label: 'Red Pin',
  },
  {
    color: 'blue',
    bgClass: 'bg-blue-500',
    shadowClass: 'shadow-blue-500/40',
    label: 'Blue Pin',
  },
  {
    color: 'yellow',
    bgClass: 'bg-yellow-400',
    shadowClass: 'shadow-yellow-400/40',
    label: 'Yellow Pin',
  },
];

interface PinToolbarProps {
  onSelectColor?: (color: PinColor) => void;
  selectedColor?: PinColor | null;
}

/**
 * PinToolbar - A dock-like toolbar for selecting pin colors
 * Positioned at the bottom of the screen with a glass-morphism effect
 */
export default function PinToolbar({ onSelectColor, selectedColor }: PinToolbarProps) {
  const [hoveredColor, setHoveredColor] = useState<PinColor | null>(null);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none pb-6 sm:pb-8">
      <div className="flex justify-center">
        {/* Dock Container */}
        <div className="pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
            {/* Pin Color Options */}
            {PIN_COLORS.map(({ color, bgClass, shadowClass, label }) => {
              const isSelected = selectedColor === color;
              const isHovered = hoveredColor === color;
              
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={label}
                  onClick={() => onSelectColor?.(color)}
                  onMouseEnter={() => setHoveredColor(color)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={`
                    relative group
                    w-11 h-11 sm:w-14 sm:h-14
                    rounded-full
                    transition-all duration-200 ease-out
                    ${isSelected ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-gray-800' : ''}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-800
                  `}
                >
                  {/* Pin Icon - Custom SVG */}
                  <div
                    className={`
                      w-full h-full rounded-full
                      ${bgClass}
                      shadow-lg ${shadowClass}
                      flex items-center justify-center
                      transition-transform duration-200
                      ${isHovered || isSelected ? 'shadow-xl' : ''}
                    `}
                  >
                    {/* Pin Symbol */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                        fill="currentColor"
                      />
                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        fill="white"
                        fillOpacity="0.9"
                      />
                    </svg>
                  </div>

                  {/* Tooltip */}
                  <div
                    className={`
                      absolute -top-10 left-1/2 -translate-x-1/2
                      px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg
                      whitespace-nowrap
                      transition-all duration-200
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
                    `}
                  >
                    {label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-8 sm:h-10 bg-gray-200/80 mx-1" />

            {/* Help Text / Instructions */}
            <div className="hidden sm:flex flex-col items-start text-xs text-gray-500">
              <span className="font-medium text-gray-700">Select a pin</span>
              <span>then tap on the map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

