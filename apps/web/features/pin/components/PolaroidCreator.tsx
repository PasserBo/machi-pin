import { useCallback, useEffect, useRef, useState } from 'react';

interface PolaroidCreatorProps {
  onSave: (file: File | null, memo: string) => Promise<void>;
}

export default function PolaroidCreator({ onSave }: PolaroidCreatorProps) {
  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');
  const [memo, setMemo] = useState('');
  const [tempPhoto, setTempPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setTempPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    },
    [photoPreview],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(tempPhoto, memo);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, memo, onSave, tempPhoto]);

  return (
    <div className="relative pointer-events-auto w-[300px] sm:w-[340px]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
        disabled={isSaving}
      />

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
                  onClick={handleUploadClick}
                  disabled={isSaving}
                  className="w-full h-full relative group"
                >
                  <img
                    src={photoPreview}
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
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </div>

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
  );
}
