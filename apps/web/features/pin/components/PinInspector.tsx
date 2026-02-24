import { useEffect, useState, useRef, useCallback } from 'react';
import type { PinDocument } from '@repo/types';
import { createPolaroidForPin } from '../repositories/pinRepository';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface PinInspectorProps {
  pin: InspectorPin | null;
  mapId: string;
  userId: string;
  onSaveSuccess?: () => void;
}

export default function PinInspector({ pin, mapId, userId, onSaveSuccess }: PinInspectorProps) {
  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');
  const [textContent, setTextContent] = useState('');
  const [tempPhoto, setTempPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when a new pin is selected
  useEffect(() => {
    if (pin) {
      setActiveSide('photo');
      setTextContent('');
      setTempPhoto(null);
      setPhotoPreview(null);
      setToast(null);
    }
  }, [pin?.id]);

  // Clean up object URL when component unmounts or photo changes
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Photo Upload ────────────────────────────────────────────

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  }, [photoPreview]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ── Save ──────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!pin || isSaving) return;

    // Must have at least a photo or some text
    if (!tempPhoto && !textContent.trim()) {
      setToast({ message: 'Add a photo or memo first', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await createPolaroidForPin({
        mapId,
        pinId: pin.id,
        userId,
        file: tempPhoto ?? undefined,
        memo: textContent.trim() || undefined,
      });

      setToast({ message: 'Polaroid Pinned!', type: 'success' });

      // Brief delay so user sees the toast, then close
      setTimeout(() => {
        onSaveSuccess?.();
      }, 600);
    } catch (error) {
      console.error('Failed to save polaroid:', error);
      setToast({ message: 'Failed to save polaroid', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [pin, mapId, userId, tempPhoto, textContent, isSaving, onSaveSuccess]);

  // ── Render ────────────────────────────────────────────────

  const isOpen = Boolean(pin);
  const hasPhoto = Boolean(photoPreview);

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
        disabled={isSaving}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-4 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[110%] pointer-events-none'
        }`}
      >
        <div className="relative pointer-events-auto w-[300px] sm:w-[340px]">
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute left-1/2 -top-6 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition z-10 ${
              isSaving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Saving...
              </span>
            ) : (
              '📌 Save'
            )}
          </button>

          {/* Card with 3D flip */}
          <div className="rounded-3xl shadow-2xl border border-stone-200 aspect-[3/4] [perspective:1000px]">
            <div
              className="relative w-full h-full rounded-3xl transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
              style={{
                transform: activeSide === 'text' ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front: Photo side */}
              <div
                className="absolute inset-0 rounded-3xl bg-stone-100 p-5 [backface-visibility:hidden]"
                style={{ transform: 'rotateY(0deg)' }}
              >
                <div className="h-full w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                  {hasPhoto ? (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isSaving}
                      className="w-full h-full relative group"
                    >
                      <img
                        src={photoPreview!}
                        alt="Polaroid preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      {!isSaving && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-2xl flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                            Change photo
                          </span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-700/40 bg-amber-50/80 hover:bg-amber-100/80 hover:border-amber-700/60 transition-colors text-amber-900/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleUploadClick}
                      disabled={isSaving}
                    >
                      <span className="text-4xl opacity-80">📷</span>
                      <span className="font-medium text-sm tracking-wide">点击上传</span>
                      <span className="text-xs opacity-70">Click to upload</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Back: Text side (letter paper) */}
              <div
                className="absolute inset-0 rounded-3xl bg-stone-100 p-5 [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div
                  className="h-full w-full rounded-2xl overflow-hidden flex flex-col p-4 shadow-inner"
                  style={{
                    backgroundColor: '#faf8f5',
                    backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 93%, rgba(0,0,0,0.08) 93%, rgba(0,0,0,0.08) 100%)',
                    backgroundSize: '100% 28px',
                  }}
                >
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="写下这里的回忆…"
                    className="flex-1 w-full min-h-0 resize-none bg-transparent border-none outline-none text-stone-700 text-sm leading-7 placeholder:text-stone-400 disabled:opacity-50"
                    rows={1}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side icons (right of card) */}
          <div className="absolute top-1/2 right-0 ml-3 -translate-y-1/2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setActiveSide('photo')}
              disabled={isSaving}
              className={`h-11 w-11 rounded-full shadow-lg transition ${
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
              disabled={isSaving}
              className={`h-11 w-11 rounded-full shadow-lg transition text-sm font-bold ${
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
      </div>

      {/* Toast */}
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

      {/* Toast animation styles */}
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
