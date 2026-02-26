import { useEffect, useState, useCallback } from 'react';
import type { PinDocument, Polaroid } from '@repo/types';
import { createPolaroidForPin, deletePolaroid, getPolaroid } from '../repositories/pinRepository';
import PolaroidViewer from './PolaroidViewer';
import PolaroidCreator from './PolaroidCreator';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface PinInspectorProps {
  pin: InspectorPin | null;
  mapId: string;
  userId: string;
}

export default function PinInspector({ pin, mapId, userId }: PinInspectorProps) {
  const [activePolaroid, setActivePolaroid] = useState<Polaroid | null>(null);
  const [attachedPolaroidIds, setAttachedPolaroidIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const attachedIdsKey = pin?.attachedPolaroidIds?.join('|') ?? '';

  useEffect(() => {
    let cancelled = false;

    async function hydrateLatestPolaroid() {
      if (!pin) {
        setAttachedPolaroidIds([]);
        setActivePolaroid(null);
        setIsLoading(false);
        return;
      }

      const ids = pin.attachedPolaroidIds ?? [];
      setAttachedPolaroidIds(ids);
      if (ids.length === 0) {
        setActivePolaroid(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const latestId = ids[ids.length - 1];
        if (!latestId) {
          setActivePolaroid(null);
          return;
        }
        const data = await getPolaroid(pin.mapId, latestId);
        if (!cancelled) {
          setActivePolaroid(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch polaroid:', error);
          setActivePolaroid(null);
          setToast({ message: 'Failed to load polaroid', type: 'error' });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    hydrateLatestPolaroid();
    return () => {
      cancelled = true;
    };
  }, [pin?.id, pin?.mapId, attachedIdsKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSave = useCallback(
    async (file: File | null, memo: string) => {
      if (!pin || !userId) return;
      if (!file && !memo.trim()) {
        setToast({ message: 'Add a photo or memo first', type: 'error' });
        return;
      }

      try {
        const newPolaroidId = await createPolaroidForPin({
          mapId,
          pinId: pin.id,
          userId,
          file: file ?? undefined,
          memo: memo.trim() || undefined,
        });

        const latest = await getPolaroid(mapId, newPolaroidId);
        if (!latest) {
          setToast({ message: 'Saved, but failed to hydrate card', type: 'error' });
          return;
        }
        setAttachedPolaroidIds((prev) => {
          if (prev.includes(newPolaroidId)) return prev;
          return [...prev, newPolaroidId];
        });
        setActivePolaroid(latest);
        setToast({ message: 'Polaroid pinned!', type: 'success' });
      } catch (error) {
        console.error('Failed to save polaroid:', error);
        setToast({ message: 'Failed to save polaroid', type: 'error' });
      }
    },
    [pin, userId, mapId],
  );

  const handleDelete = useCallback(async () => {
    if (!pin || !activePolaroid) return;

    setIsLoading(true);
    try {
      await deletePolaroid(pin.mapId, pin.id, activePolaroid.id, activePolaroid.storagePath);

      const newIds = attachedPolaroidIds.filter((id) => id !== activePolaroid.id);
      setAttachedPolaroidIds(newIds);

      if (newIds.length === 0) {
        setActivePolaroid(null);
      } else {
        const latestId = newIds[newIds.length - 1];
        if (!latestId) {
          setActivePolaroid(null);
        } else {
          const latest = await getPolaroid(pin.mapId, latestId);
          setActivePolaroid(latest);
        }
      }

      setToast({ message: 'Polaroid deleted', type: 'success' });
    } catch (error) {
      console.error('Failed to delete polaroid:', error);
      setToast({ message: 'Failed to delete polaroid', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [pin, activePolaroid, attachedPolaroidIds]);

  const isOpen = Boolean(pin);

  return (
    <>
      <div
        className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-4 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[110%] pointer-events-none'
        }`}
      >
        {isOpen && (
          <>
            {isLoading ? (
              <div className="relative pointer-events-auto w-[300px] sm:w-[340px]">
                <div className="rounded-3xl shadow-2xl border border-stone-200 aspect-[3/4] bg-stone-100 p-5 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-stone-50/90 border border-stone-200 flex flex-col items-center justify-center gap-3">
                    <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-stone-500/30 border-r-stone-700" />
                    <span className="text-sm text-stone-600 tracking-wide">Hydrating polaroid...</span>
                  </div>
                </div>
              </div>
            ) : activePolaroid ? (
              <PolaroidViewer polaroid={activePolaroid} onDelete={handleDelete} />
            ) : (
              <PolaroidCreator onSave={handleSave} />
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`px-6 py-3 rounded-2xl shadow-lg text-white text-sm font-medium ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? '✅ ' : '⚠️ '}
            {toast.message}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
