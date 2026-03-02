import { useCallback, useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

interface PolaroidCreatorProps {
  onSave: (file: File | null, memo: string) => Promise<void>;
  isPeeking: boolean;
  isOpen: boolean;
  onPeekingClick: () => void;
}

export default function PolaroidCreator({
  onSave,
  isPeeking,
  isOpen,
  onPeekingClick,
}: PolaroidCreatorProps) {
  const NARROW_SCREEN_BREAKPOINT = 640;
  const NARROW_PEEK_TRANSLATE_X = 90;
  const DEFAULT_PEEK_TRANSLATE_X = 80;

  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');
  const [memo, setMemo] = useState('');
  const [tempPhoto, setTempPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScreenState = () => {
      setIsNarrowScreen(window.innerWidth <= NARROW_SCREEN_BREAKPOINT);
    };

    updateScreenState();
    window.addEventListener('resize', updateScreenState);
    return () => window.removeEventListener('resize', updateScreenState);
  }, [NARROW_SCREEN_BREAKPOINT]);

  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsCompressing(true);
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
        });

        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
        }

        setTempPhoto(compressedFile);
        setPhotoPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('Image compression failed, falling back to original file:', error);
        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
        }
        setTempPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
      } finally {
        setIsCompressing(false);
      }
    },
    [photoPreview],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving || isCompressing) return;
    setIsSaving(true);
    try {
      await onSave(tempPhoto, memo);
    } finally {
      setIsSaving(false);
    }
  }, [isCompressing, isSaving, memo, onSave, tempPhoto]);

  // --- Positional style based on state ---
  const isHidden = !isPeeking && !isOpen;
  const busy = isSaving || isCompressing;

  let wrapperStyle: React.CSSProperties;
  let wrapperClassName: string;

  if (isHidden) {
    wrapperStyle = { transform: 'translateX(120%)', opacity: 0 };
    wrapperClassName = 'pointer-events-none';
  } else if (isOpen) {
    wrapperStyle = { transform: 'translateX(0) rotate(0deg)', opacity: 1 };
    wrapperClassName = '';
  } else {
    const tilt = isHovered ? -12 : -6;
    const peekingTranslateX = isNarrowScreen
      ? NARROW_PEEK_TRANSLATE_X
      : DEFAULT_PEEK_TRANSLATE_X;
    wrapperStyle = {
      transform: `translateX(${peekingTranslateX}%) rotate(${tilt}deg)`,
      opacity: 1,
      cursor: 'pointer',
    };
    wrapperClassName = '';
  }

  const isPeekingOnly = isPeeking && !isOpen;

  return (
    <div
      className={`fixed right-4 bottom-[15%] z-40 transition-all duration-500 ease-out ${wrapperClassName}`}
      style={wrapperStyle}
      onMouseEnter={isPeekingOnly ? () => setIsHovered(true) : undefined}
      onMouseLeave={isPeekingOnly ? () => setIsHovered(false) : undefined}
    >
      <div className="relative pointer-events-auto w-[300px] sm:w-[340px]">
        {isPeekingOnly && (
          <div
            className="absolute inset-0 z-20 cursor-pointer rounded-3xl"
            onClick={onPeekingClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPeekingClick(); }}
            aria-label="Open creator"
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
          disabled={busy || !isOpen}
        />

        {isOpen && (
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className={`absolute left-1/2 -top-6 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition z-10 ${
              busy
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                {isCompressing ? 'Compressing...' : 'Saving...'}
              </span>
            ) : (
              '📌 Save'
            )}
          </button>
        )}

        <div className="rounded-3xl shadow-2xl border border-stone-200 aspect-[3/4] [perspective:1000px] bg-white/80">
          <div
            className="relative w-full h-full rounded-3xl transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
            style={{
              transform: activeSide === 'text' ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl bg-stone-100 p-5 [backface-visibility:hidden]"
              style={{ transform: 'rotateY(0deg)' }}
            >
              <div className="h-full w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                {photoPreview ? (
                  <button
                    type="button"
                    onClick={isOpen ? handleUploadClick : undefined}
                    disabled={busy || !isOpen}
                    className="w-full h-full relative group"
                  >
                    <img
                      src={photoPreview}
                      alt="Polaroid preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    {!busy && isOpen && (
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
                    onClick={isOpen ? handleUploadClick : undefined}
                    disabled={busy || !isOpen}
                  >
                    <span className="text-4xl opacity-80">📷</span>
                    <span className="font-medium text-sm tracking-wide">
                      {isCompressing ? '压缩中…' : '点击上传'}
                    </span>
                    <span className="text-xs opacity-70">
                      {isCompressing ? 'Compressing...' : 'Click to upload'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-3xl bg-stone-100 p-5 [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div
                className="h-full w-full rounded-2xl overflow-hidden flex flex-col p-4 shadow-inner"
                style={{
                  backgroundColor: '#faf8f5',
                  backgroundImage:
                    'linear-gradient(to bottom, transparent 0%, transparent 93%, rgba(0,0,0,0.08) 93%, rgba(0,0,0,0.08) 100%)',
                  backgroundSize: '100% 28px',
                }}
              >
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="写下这里的回忆…"
                  className="flex-1 w-full min-h-0 resize-none bg-transparent border-none outline-none text-stone-700 text-sm leading-7 placeholder:text-stone-400 disabled:opacity-50"
                  rows={1}
                  disabled={busy || !isOpen}
                />
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-1/2 right-0 ml-3 -translate-y-1/2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setActiveSide('photo')}
              disabled={busy}
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
              disabled={busy}
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
        )}
      </div>
    </div>
  );
}
