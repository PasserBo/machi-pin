import { useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { Polaroid } from '@repo/types';

const CARD_WIDTH = 260;
const CARD_ASPECT = 3 / 4;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT;

const SWIPE_THRESHOLD = 50;
const VISIBLE_STACK_SIZE = 3;
const PRELOAD_RANGE = 2;

interface PolaroidDeckProps {
  polaroids: Polaroid[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onAddNew: () => void;
  onDelete?: (polaroid: Polaroid) => void;
  anchor: { x: number; y: number };
}

function PolaroidCard({
  polaroid,
  onDelete,
}: {
  polaroid: Polaroid;
  onDelete?: () => void;
}) {
  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');

  const handleDeleteClick = () => {
    if (!onDelete) return;
    const confirmed = window.confirm('Are you sure you want to delete this memory?');
    if (!confirmed) return;
    onDelete();
  };

  return (
    <div className="w-full h-full [perspective:1000px]">
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
        style={{
          transform: activeSide === 'text' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Photo side */}
        <div
          className="absolute inset-0 rounded-3xl bg-stone-100 p-4 [backface-visibility:hidden]"
          style={{ transform: 'rotateY(0deg)' }}
        >
          <div className="h-full w-full rounded-2xl overflow-hidden flex items-center justify-center bg-stone-200">
            {polaroid.photoUrl ? (
              <img
                src={polaroid.photoUrl}
                alt="Polaroid"
                className="w-full h-full object-cover rounded-2xl"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full rounded-2xl flex flex-col items-center justify-center text-stone-500 bg-stone-100">
                <span className="text-3xl">📷</span>
                <span className="mt-2 text-xs">No photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Memo side */}
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

      {/* Side tabs */}
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

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full rounded-3xl border-2 border-dashed border-amber-700/30 bg-amber-50/60 flex flex-col items-center justify-center gap-3 hover:bg-amber-100/60 hover:border-amber-700/50 transition-colors"
    >
      <span className="text-5xl text-amber-700/50">+</span>
      <span className="text-sm font-medium text-amber-800/70 tracking-wide">
        Add a memory
      </span>
    </button>
  );
}

export default function PolaroidDeck({
  polaroids,
  currentIndex,
  onIndexChange,
  onAddNew,
  onDelete,
  anchor,
}: PolaroidDeckProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const PIN_CONNECTOR_HEIGHT = 18;
  const viewerLeft = anchor.x - CARD_WIDTH / 2;
  const viewerTop = anchor.y + PIN_CONNECTOR_HEIGHT;

  const total = polaroids.length;
  const isAtEnd = currentIndex >= total;
  const canGoNext = currentIndex < total;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) onIndexChange(currentIndex + 1);
  }, [canGoNext, currentIndex, onIndexChange]);

  const goPrev = useCallback(() => {
    if (canGoPrev) onIndexChange(currentIndex - 1);
  }, [canGoPrev, currentIndex, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Preload adjacent images so swipe transitions feel instant
  useEffect(() => {
    const start = Math.max(0, currentIndex - PRELOAD_RANGE);
    const end = Math.min(total, currentIndex + PRELOAD_RANGE + 1);

    for (let i = start; i < end; i++) {
      const url = polaroids[i]?.photoUrl;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    }
  }, [currentIndex, polaroids, total]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const swipe = info.offset.x;
      const velocity = info.velocity.x;

      // Use velocity to make flick gestures feel responsive
      if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
        animate(x, -300, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          onComplete: () => {
            x.set(0);
            goNext();
          },
        });
      } else if (swipe > SWIPE_THRESHOLD || velocity > 500) {
        animate(x, 300, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          onComplete: () => {
            x.set(0);
            goPrev();
          },
        });
      } else {
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [goNext, goPrev, x],
  );

  return (
    <div
      className="fixed pointer-events-auto touch-pan-y overscroll-y-contain"
      style={{
        left: viewerLeft,
        top: viewerTop,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: 25,
      }}
    >
      {/* Pin connector line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-stone-400/60"
        style={{ top: -PIN_CONNECTOR_HEIGHT, height: PIN_CONNECTOR_HEIGHT }}
      />

      {/* Counter badge */}
      {total > 1 && !isAtEnd && (
        <div className="absolute -top-3 -right-3 z-50 bg-black/70 text-white text-[10px] font-semibold rounded-full h-6 min-w-6 px-1.5 flex items-center justify-center shadow-lg backdrop-blur-sm">
          {currentIndex + 1}/{total}
        </div>
      )}

      {/* Card stack */}
      <div className="relative w-full h-full">
        {isAtEnd ? (
          /* Plus card */
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AddCard onClick={onAddNew} />
          </motion.div>
        ) : (
          <>
            {/* Background stacked cards (rendered bottom-to-top) */}
            {Array.from({ length: Math.min(VISIBLE_STACK_SIZE - 1, total - currentIndex - 1) })
              .map((_, i) => {
                const depth = VISIBLE_STACK_SIZE - 1 - i;
                return (
                  <motion.div
                    key={`bg-${depth}`}
                    className="absolute inset-0 rounded-3xl shadow-xl border border-stone-200 bg-stone-100"
                    animate={{
                      scale: 1 - depth * 0.04,
                      y: depth * 12,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ zIndex: 10 - depth }}
                  />
                );
              })}

            {/* Top (active) card — draggable */}
            <motion.div
              key={polaroids[currentIndex]?.id ?? currentIndex}
              className="absolute inset-0 rounded-3xl shadow-2xl border border-stone-200 bg-white/80 cursor-grab active:cursor-grabbing"
              style={{ x, rotate, opacity, zIndex: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {polaroids[currentIndex] && (
                <PolaroidCard
                  polaroid={polaroids[currentIndex]}
                  onDelete={onDelete ? () => onDelete(polaroids[currentIndex]!) : undefined}
                />
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
