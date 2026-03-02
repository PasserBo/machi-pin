import { useEffect, useState, useCallback } from 'react';
import type { PinDocument, Polaroid } from '@repo/types';
import {
  createPolaroidForPin,
  deletePolaroid as deletePolaroidFromRepo,
  getPolaroid,
} from '../repositories/pinRepository';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface PinInspectorState {
  activePolaroid: Polaroid | null;
  attachedPolaroidIds: string[];
  isLoading: boolean;
  toast: Toast | null;
  creatorPeeking: boolean;
  creatorOpen: boolean;
}

export interface PinInspectorActions {
  openCreator: () => void;
  closeCreator: () => void;
  savePolaroid: (file: File | null, memo: string) => Promise<void>;
  deletePolaroid: () => Promise<void>;
}

export function usePinInspectorMachine(
  pin: InspectorPin | null,
  mapId: string,
  userId: string,
): PinInspectorState & PinInspectorActions {
  const [activePolaroid, setActivePolaroid] = useState<Polaroid | null>(null);
  const [attachedPolaroidIds, setAttachedPolaroidIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [creatorPeeking, setCreatorPeeking] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const attachedIdsKey = pin?.attachedPolaroidIds?.join('|') ?? '';

  useEffect(() => {
    let cancelled = false;

    async function hydrateLatestPolaroid() {
      if (!pin) {
        setAttachedPolaroidIds([]);
        setActivePolaroid(null);
        setIsLoading(false);
        setCreatorPeeking(false);
        setCreatorOpen(false);
        return;
      }

      const ids = pin.attachedPolaroidIds ?? [];
      setAttachedPolaroidIds(ids);

      if (ids.length === 0) {
        setActivePolaroid(null);
        setIsLoading(false);
        setCreatorPeeking(true);
        setCreatorOpen(false);
        return;
      }

      setCreatorPeeking(false);
      setCreatorOpen(false);

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

  const openCreator = useCallback(() => {
    setCreatorOpen(true);
  }, []);

  const closeCreator = useCallback(() => {
    setCreatorOpen(false);
  }, []);

  const savePolaroid = useCallback(
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
        setCreatorOpen(false);
        setCreatorPeeking(false);
        setToast({ message: 'Polaroid pinned!', type: 'success' });
      } catch (error) {
        console.error('Failed to save polaroid:', error);
        setToast({ message: 'Failed to save polaroid', type: 'error' });
      }
    },
    [pin, userId, mapId],
  );

  const deletePolaroid = useCallback(async () => {
    if (!pin || !activePolaroid) return;

    setIsLoading(true);
    try {
      await deletePolaroidFromRepo(
        pin.mapId,
        pin.id,
        activePolaroid.id,
        activePolaroid.storagePath,
      );

      const newIds = attachedPolaroidIds.filter((id) => id !== activePolaroid.id);
      setAttachedPolaroidIds(newIds);

      if (newIds.length === 0) {
        setActivePolaroid(null);
        setCreatorPeeking(true);
        setCreatorOpen(false);
      } else {
        const latestId = newIds[newIds.length - 1];
        if (!latestId) {
          setActivePolaroid(null);
          setCreatorPeeking(true);
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

  return {
    activePolaroid,
    attachedPolaroidIds,
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
