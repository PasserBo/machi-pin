import { useEffect, useState } from 'react';
import type { PinDocument } from '@repo/types';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface PinInspectorProps {
  pin: InspectorPin | null;
}

export default function PinInspector({ pin }: PinInspectorProps) {
  const [activeSide, setActiveSide] = useState<'photo' | 'text'>('photo');
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (pin) {
      setActiveSide('photo');
      // TODO: load text from Firestore when available
      setTextContent('');
    }
  }, [pin?.id]);

  const isOpen = Boolean(pin);
  const hasPhoto = false; // TODO: derive from pin / Firestore when available

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-4 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[110%] pointer-events-none'
      }`}
    >
      <div className="relative pointer-events-auto w-[300px] sm:w-[340px]">
        <button
          type="button"
          onClick={() => {
            console.log('📌 Save clicked', { pinId: pin?.id, activeSide });
          }}
          className="absolute left-1/2 -top-6 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 text-sm font-semibold shadow-lg hover:bg-gray-800 transition z-10"
        >
          📌 Save
        </button>

        {/* Card with 3D flip: perspective wrapper + rotatable inner + two faces */}
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
                  <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-500">
                    {/* TODO: show pin photo from Firestore */}
                    <span className="text-sm">Photo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-700/40 bg-amber-50/80 hover:bg-amber-100/80 hover:border-amber-700/60 transition-colors text-amber-900/90"
                    onClick={() => console.log('Upload photo placeholder')}
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
                className="h-full w-full rounded-2xl overflow-hidden flex flex-col bg-[linear-gradient(to_bottom,transparent_0%,transparent_94%,rgba(0,0,0,0.06)_94%,rgba(0,0,0,0.06)_100%)] bg-[length:100%_28px] bg-repeat-y p-4 shadow-inner"
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
                  className="flex-1 w-full min-h-0 resize-none bg-transparent border-none outline-none text-stone-700 text-sm leading-7 placeholder:text-stone-400"
                  rows={1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Side icons: controller for activeSide (right of card, slides in with card) */}
        <div className="absolute top-1/2 right-0 ml-3 -translate-y-1/2 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setActiveSide('photo')}
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
  );
}
