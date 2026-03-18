import { useEffect, useState, useCallback } from 'react';
import type { PinDocument, Polaroid } from '@repo/types';
import {
  createPolaroidForPin,
  deletePolaroid as deletePolaroidFromRepo,
  getPolaroid,
  getPolaroidsByIds,
} from '../repositories/pinRepository';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface PinInspectorState {
  polaroids: Polaroid[];
  currentIndex: number;
  isLoading: boolean;
  toast: Toast | null;
  creatorPeeking: boolean;
  creatorOpen: boolean;
}

export interface PinInspectorActions {
  setCurrentIndex: (index: number) => void;
  openCreator: () => void;
  closeCreator: () => void;
  savePolaroid: (file: File | null, memo: string) => Promise<void>;
  deletePolaroid: (polaroid: Polaroid) => Promise<void>;
}

export function usePinInspectorMachine(
  pin: InspectorPin | null,
  mapId: string,
  userId: string,
  canEdit = true,
): PinInspectorState & PinInspectorActions {
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [creatorPeeking, setCreatorPeeking] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const attachedIdsKey = pin?.attachedPolaroidIds?.join('|') ?? '';

  useEffect(() => {
    let cancelled = false;

    async function hydrateAllPolaroids() {
      if (!pin) {
        setPolaroids([]);
        setCurrentIndex(0);
        setIsLoading(false);
        setCreatorPeeking(false);
        setCreatorOpen(false);
        return;
      }

      const ids = pin.attachedPolaroidIds ?? [];

      if (ids.length === 0) {
        setPolaroids([]);
        setCurrentIndex(0);
        setIsLoading(false);
        setCreatorPeeking(true);
        setCreatorOpen(false);
        return;
      }

      setCreatorPeeking(true);
      setCreatorOpen(false);
      setIsLoading(true);

      try {
        const all = await getPolaroidsByIds(pin.mapId, ids);
        if (cancelled) return;

        // Sort newest-first by createdAt
        all.sort((a, b) => {
          const ta = typeof a.createdAt === 'number' ? a.createdAt : 0;
          const tb = typeof b.createdAt === 'number' ? b.createdAt : 0;
          return tb - ta;
        });

        setPolaroids(all);
        setCurrentIndex(0);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch polaroids:', error);
          setPolaroids([]);
          setToast({ message: 'Failed to load polaroids', type: 'error' });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrateAllPolaroids();
    return () => { cancelled = true; };
  }, [pin?.id, pin?.mapId, attachedIdsKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const openCreator = useCallback(() => {
    if (!canEdit) return;
    setCreatorOpen(true);
  }, [canEdit]);

  const closeCreator = useCallback(() => {
    setCreatorOpen(false);
  }, []);

  const savePolaroid = useCallback(
    async (file: File | null, memo: string) => {
      if (!canEdit) return;
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

        setPolaroids((prev) => [latest, ...prev]);
        setCurrentIndex(0);
        setCreatorOpen(false);
        setCreatorPeeking(true);
        setToast({ message: 'Polaroid pinned!', type: 'success' });
      } catch (error) {
        console.error('Failed to save polaroid:', error);
        setToast({ message: 'Failed to save polaroid', type: 'error' });
      }
    },
    [pin, userId, mapId, canEdit],
  );

  const deletePolaroid = useCallback(
    async (polaroid: Polaroid) => {
      if (!canEdit) return;
      if (!pin) return;

      setIsLoading(true);
      try {
        await deletePolaroidFromRepo(
          pin.mapId,
          pin.id,
          polaroid.id,
          polaroid.storagePath,
        );

        setPolaroids((prev) => {
          const next = prev.filter((p) => p.id !== polaroid.id);
          if (next.length === 0) {
            setCreatorPeeking(true);
            setCreatorOpen(false);
          }
          return next;
        });

        setCurrentIndex((prev) => Math.min(prev, Math.max(polaroids.length - 2, 0)));
        setToast({ message: 'Polaroid deleted', type: 'success' });
      } catch (error) {
        console.error('Failed to delete polaroid:', error);
        setToast({ message: 'Failed to delete polaroid', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [pin, polaroids.length, canEdit],
  );

  return {
    polaroids,
    currentIndex,
    setCurrentIndex,
    isLoading,
    toast,
    creatorPeeking,
    creatorOpen,
    openCreator,
    closeCreator,
    savePolaroid,
    deletePolaroid,
  };
}
