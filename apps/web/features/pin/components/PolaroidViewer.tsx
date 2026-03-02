import { useState } from 'react';
import type { Polaroid } from '@repo/types';

interface PolaroidViewerProps {
  polaroid: Polaroid;
  onDelete?: () => void;
  anchor: { x: number; y: number };
}

const CARD_WIDTH = 260;
const CARD_ASPECT = 3 / 4;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT;
const PIN_CONNECTOR_HEIGHT = 18;

export default function PolaroidViewer({ polaroid, onDelete, anchor }: PolaroidViewerProps) {
  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');

  const handleDeleteClick = () => {
    if (!onDelete) return;
    const confirmed = window.confirm('Are you sure you want to delete this memory?');
    if (!confirmed) return;
    onDelete();
  };

  const viewerLeft = anchor.x - CARD_WIDTH / 2;
  const viewerTop = anchor.y + PIN_CONNECTOR_HEIGHT;

  return (
    <div
      className="fixed pointer-events-auto"
      style={{
        left: viewerLeft,
        top: viewerTop,
        width: CARD_WIDTH,
        zIndex: 25,
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-stone-400/60"
        style={{
          top: -PIN_CONNECTOR_HEIGHT,
          height: PIN_CONNECTOR_HEIGHT,
        }}
      />

      <div
        className="rounded-3xl shadow-2xl border border-stone-200 [perspective:1000px] bg-white/80"
        style={{ aspectRatio: '3/4' }}
      >
        <div
          className="relative w-full h-full rounded-3xl transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
          style={{
            transform: activeSide === 'text' ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl bg-stone-100 p-4 [backface-visibility:hidden]"
            style={{ transform: 'rotateY(0deg)' }}
          >
            <div className="h-full w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-stone-200">
              {polaroid.photoUrl ? (
                <img
                  src={polaroid.photoUrl}
                  alt="Polaroid"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="h-full w-full rounded-2xl flex flex-col items-center justify-center text-stone-500 bg-stone-100">
                  <span className="text-3xl">📷</span>
                  <span className="mt-2 text-xs">No photo</span>
                </div>
              )}
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-3xl bg-stone-100 p-4 [backface-visibility:hidden]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div
              className="h-full w-full rounded-2xl overflow-hidden flex flex-col p-3 shadow-inner"
              style={{
                backgroundColor: '#faf8f5',
                backgroundImage:
                  'linear-gradient(to bottom, transparent 0%, transparent 93%, rgba(0,0,0,0.08) 93%, rgba(0,0,0,0.08) 100%)',
                backgroundSize: '100% 24px',
              }}
            >
              <div className="flex-1 w-full min-h-0 text-stone-700 text-xs leading-6 whitespace-pre-wrap break-words">
                {polaroid.memo?.trim() ? polaroid.memo : 'No memo'}
              </div>
              {onDelete && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="h-8 w-8 rounded-full bg-white/80 text-stone-500 shadow hover:text-red-500 hover:bg-white transition text-sm"
                    aria-label="Delete polaroid"
                    title="Delete memory"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setActiveSide('photo')}
          className={`h-9 w-9 rounded-full shadow-lg transition text-sm ${
            activeSide === 'photo'
              ? 'bg-black text-white shadow-xl ring-2 ring-offset-2 ring-stone-400'
              : 'bg-white text-gray-400 hover:bg-stone-50 hover:text-gray-600'
          }`}
          aria-label="Photo side"
        >
          📷
        </button>
        <button
          type="button"
          onClick={() => setActiveSide('text')}
          className={`h-9 w-9 rounded-full shadow-lg transition text-xs font-bold ${
            activeSide === 'text'
              ? 'bg-black text-white shadow-xl ring-2 ring-offset-2 ring-stone-400'
              : 'bg-white text-gray-400 hover:bg-stone-50 hover:text-gray-600'
          }`}
          aria-label="Text side"
        >
          A
        </button>
      </div>
    </div>
  );
}
