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
  coverPhotoUrl?: string;
  polaroidCount?: number;
  children?: ReactNode;
}

function PinIcon({ pinColor, isSelected }: { pinColor: string; isSelected: boolean }) {
  return (
    <div className="relative" style={{ zIndex: 2 }}>
      <div
        className="absolute -bottom-1 left-1/2 w-5 h-2 rounded-full opacity-40"
        style={{ backgroundColor: '#000', transform: 'translateX(-50%)', filter: 'blur(3px)' }}
      />
      <svg
        viewBox="0 0 24 30"
        fill="none"
        className="w-7 h-8 drop-shadow-md"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))' }}
      >
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z"
          fill={pinColor}
        />
        <circle cx="12" cy="11" r="4" fill="white" fillOpacity="0.9" />
        <ellipse cx="8" cy="7" rx="2" ry="1.5" fill="white" fillOpacity="0.4" />
      </svg>
      {isSelected && (
        <div
          className="absolute -inset-1 rounded-full border-2 animate-pulse"
          style={{ borderColor: pinColor }}
        />
      )}
    </div>
  );
}

function PolaroidStamp({
  coverPhotoUrl,
  polaroidCount,
}: {
  coverPhotoUrl: string;
  polaroidCount: number;
}) {
  const hasStack = polaroidCount > 1;

  return (
    <div className="relative w-12 h-14 mt-0.5" style={{ zIndex: 1 }}>
      {/* Stacked pseudo-cards behind the main stamp */}
      {hasStack && (
        <>
          <div
            className="absolute inset-0 rounded-sm bg-stone-100 shadow"
            style={{ transform: 'rotate(-6deg)' }}
          />
          {polaroidCount > 2 && (
            <div
              className="absolute inset-0 rounded-sm bg-stone-50 shadow"
              style={{ transform: 'rotate(4deg)' }}
            />
          )}
        </>
      )}

      {/* Main polaroid card */}
      <div className="relative w-full h-full rounded-sm bg-stone-50 p-1 shadow-md flex flex-col">
        <img
          src={coverPhotoUrl}
          alt=""
          className="w-full aspect-square object-cover rounded-[1px]"
          draggable={false}
        />
        <div className="flex-1" />
      </div>
    </div>
  );
}

export default function PinMarker({
  color,
  onClick,
  isSelected = false,
  coverPhotoUrl,
  polaroidCount = 0,
  children,
}: PinMarkerProps) {
  const pinColor = PIN_COLOR_MAP[color];
  const hasCover = !!coverPhotoUrl;

  return (
    <div className="relative">
      {children}
      <div
        className={`relative cursor-pointer transition-transform duration-150 ease-out hover:scale-110 hover:-translate-y-0.5 ${isSelected ? 'scale-110 -translate-y-0.5' : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        style={{ transformOrigin: 'bottom center' }}
      >
        {/* Pin icon — determines the container's layout height (anchor="bottom" reference) */}
        <div className="flex justify-center">
          <PinIcon pinColor={pinColor} isSelected={isSelected} />
        </div>

        {/* Polaroid stamp — absolutely positioned so it doesn't shift the pin icon */}
        {hasCover && (
          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <PolaroidStamp coverPhotoUrl={coverPhotoUrl} polaroidCount={polaroidCount} />
          </div>
        )}
      </div>
    </div>
  );
}
