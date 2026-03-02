import type { ReactNode } from 'react';
import type { PinColor } from '@repo/types';

const PIN_COLOR_MAP: Record<PinColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#facc15',
};

interface PinMarkerProps {
  color: PinColor;
  onClick?: () => void;
  isSelected?: boolean;
  children?: ReactNode;
}

export default function PinMarker({ color, onClick, isSelected = false, children }: PinMarkerProps) {
  const pinColor = PIN_COLOR_MAP[color];
  return (
    <div className="relative">
      {children}
      <div
        className={`relative cursor-pointer transition-transform duration-150 ease-out hover:scale-110 hover:-translate-y-0.5 ${isSelected ? 'scale-110 -translate-y-0.5' : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <div className="absolute -bottom-1 left-1/2 w-5 h-2 rounded-full opacity-40" style={{ backgroundColor: '#000', transform: 'translateX(-50%)', filter: 'blur(3px)' }} />
        <svg viewBox="0 0 24 30" fill="none" className="w-7 h-8 drop-shadow-md" style={{ filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))' }}>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z" fill={pinColor} />
          <circle cx="12" cy="11" r="4" fill="white" fillOpacity="0.9" />
          <ellipse cx="8" cy="7" rx="2" ry="1.5" fill="white" fillOpacity="0.4" />
        </svg>
        {isSelected && <div className="absolute -inset-1 rounded-full border-2 animate-pulse" style={{ borderColor: pinColor }} />}
      </div>
    </div>
  );
}
