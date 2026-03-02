import { usePinInspectorMachine } from '../hooks/usePinInspectorMachine';
import type { InspectorPin } from '../hooks/usePinInspectorMachine';
import PolaroidViewer from './PolaroidViewer';
import PolaroidCreator from './PolaroidCreator';

export type { InspectorPin };

interface PinInspectorProps {
  pin: InspectorPin | null;
  mapId: string;
  userId: string;
  pinAnchor: { x: number; y: number } | null;
}

export default function PinInspector({ pin, mapId, userId, pinAnchor }: PinInspectorProps) {
  const machine = usePinInspectorMachine(pin, mapId, userId);

  const showViewer = Boolean(pin) && !machine.isLoading && machine.activePolaroid !== null;
  const showCreator = Boolean(pin);

  return (
    <>
      {showViewer && pinAnchor && machine.activePolaroid && (
        <PolaroidViewer
          polaroid={machine.activePolaroid}
          onDelete={machine.deletePolaroid}
          anchor={pinAnchor}
        />
      )}

      {machine.isLoading && pin && pinAnchor && (
        <div
          className="fixed pointer-events-auto"
          style={{
            left: pinAnchor.x - 130,
            top: pinAnchor.y + 18,
            width: 260,
            zIndex: 25,
          }}
        >
          <div className="rounded-3xl shadow-2xl border border-stone-200 bg-stone-100 p-5 flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
            <div className="w-full h-full rounded-2xl bg-stone-50/90 border border-stone-200 flex flex-col items-center justify-center gap-3">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-stone-500/30 border-r-stone-700" />
              <span className="text-xs text-stone-600 tracking-wide">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {showCreator && (
        <PolaroidCreator
          onSave={machine.savePolaroid}
          isPeeking={machine.creatorPeeking}
          isOpen={machine.creatorOpen}
          onPeekingClick={machine.openCreator}
        />
      )}

      {machine.toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`px-6 py-3 rounded-2xl shadow-lg text-white text-sm font-medium ${
              machine.toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
            }`}
          >
            {machine.toast.type === 'success' ? '✅ ' : '⚠️ '}
            {machine.toast.message}
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
