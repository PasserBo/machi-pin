import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import type { MapDocument } from '@repo/types';

export interface MapListItem extends MapDocument {
  id: string;
}

interface MapCardProps {
  map: MapListItem;
}

export default function MapCard({ map }: MapCardProps) {
  const formattedDate = formatDate(map.createdAt);
  const previewUrl = generateMapPreview(map);

  return (
    <Link href={`/map/${map.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 group-hover:border-amber-300 group-hover:-translate-y-1">
        <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt={map.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center"><span className="text-5xl opacity-30">🗺️</span></div>
            </div>
          )}
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 transform rotate-45 translate-x-8 -translate-y-8 shadow-inner" />
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm flex items-center gap-1">
            <span className="text-red-500">📍</span>
            {map.pinCount || 0}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-amber-700 transition-colors">{map.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full capitalize">{map.styleKey || 'basic'}</span>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200" />
      </div>
    </Link>
  );
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return 'Unknown date';
  try {
    if (timestamp instanceof Timestamp) return timestamp.toDate().toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    if (timestamp instanceof Date) return timestamp.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) return (timestamp as { toDate: () => Date }).toDate().toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    return 'Unknown date';
  } catch {
    return 'Unknown date';
  }
}

function generateMapPreview(map: MapListItem): string | null {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key || !map.center) return null;
  const { lng, lat } = map.center;
  const zoom = Math.min((map.zoom || 12) - 1, 14);
  return `https://api.maptiler.com/maps/${map.styleKey || 'basic'}/static/${lng},${lat},${zoom}/400x200@2x.png?key=${key}`;
}
