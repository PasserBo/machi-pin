import { useEffect, useState } from 'react';
import type { PinDocument } from '@repo/types';

export interface InspectorPin extends PinDocument {
  id: string;
}

interface PinInspectorProps {
  pin: InspectorPin | null;
}

export default function PinInspector({ pin }: PinInspectorProps) {
  const [mode, setMode] = useState<'photo' | 'text'>('photo');

  useEffect(() => {
    if (pin) {
      setMode('photo');
    }
  }, [pin?.id]);

  const isOpen = Boolean(pin);

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
            console.log('📌 Save clicked', { pinId: pin?.id, mode });
          }}
          className="absolute left-1/2 -top-6 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 text-sm font-semibold shadow-lg hover:bg-gray-800 transition"
        >
          📌 Save
        </button>

        <div className="rounded-3xl bg-stone-100 shadow-2xl border border-stone-200 aspect-[3/4] p-5">
          {mode === 'photo' ? (
            <div className="h-full w-full rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-stone-500">
              <div className="text-center">
                <p className="text-4xl mb-2">📷</p>
                <p className="font-medium">Photo mode placeholder</p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full rounded-2xl bg-white p-4 text-stone-600">
              <h3 className="font-semibold mb-3">Text mode placeholder</h3>
              <div className="space-y-2 text-sm">
                <div className="h-3 rounded bg-stone-100" />
                <div className="h-3 rounded bg-stone-100" />
                <div className="h-3 rounded bg-stone-100 w-2/3" />
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-1/2 -right-1 -translate-y-1/2 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className={`h-11 w-11 rounded-full shadow-lg transition ${
              mode === 'photo'
                ? 'bg-black text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            aria-label="Switch to photo mode"
          >
            📷
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`h-11 w-11 rounded-full shadow-lg transition text-sm font-bold ${
              mode === 'text'
                ? 'bg-black text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            aria-label="Switch to text mode"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
}
