import type { PinColor } from '@repo/types';

const PIN_COLOR_MAP: Record<PinColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#facc15',
};

interface DragOverlayProps {
  isDragging: boolean;
  position: { x: number; y: number };
  color: PinColor;
  offsetY?: number;
}

export default function DragOverlay({
  isDragging,
  position,
  color,
  offsetY = 0,
}: DragOverlayProps) {
  if (!isDragging) return null;
  const pinColor = PIN_COLOR_MAP[color];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" style={{ touchAction: 'none' }}>
      <div
        className="absolute transition-transform duration-75 ease-out"
        style={{
          left: position.x,
          top: position.y - offsetY,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div
          className="absolute -bottom-1 left-1/2 w-4 h-2 rounded-full opacity-30"
          style={{ backgroundColor: pinColor, transform: 'translateX(-50%)', filter: 'blur(4px)' }}
        />
        <svg viewBox="0 0 24 30" fill="none" className="w-10 h-12 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z" fill={pinColor} />
          <circle cx="12" cy="11" r="4" fill="white" fillOpacity="0.9" />
          <ellipse cx="8" cy="7" rx="2" ry="1.5" fill="white" fillOpacity="0.4" />
        </svg>
        {offsetY > 0 && (
          <div className="absolute left-1/2 w-px bg-gray-400/50" style={{ transform: 'translateX(-50%)', height: offsetY, top: '100%' }}>
            <div className="absolute -left-1 bottom-0 w-2 h-2 rounded-full bg-gray-400/50" />
          </div>
        )}
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-full">
        Drag to place pin
      </div>
    </div>
  );
}
