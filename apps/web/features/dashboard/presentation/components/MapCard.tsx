import Link from 'next/link';
import type { MapDocument, MapVisibility } from '@repo/types';

export interface MapListItem extends MapDocument {
  id: string;
}

interface MapCardProps {
  map: MapListItem;
  isUpdatingVisibility?: boolean;
  onVisibilityChange?: (mapId: string, visibility: MapVisibility) => void;
  onCopyPublicLink?: (mapId: string) => void;
}

export default function MapCard({
  map,
  isUpdatingVisibility = false,
  onVisibilityChange,
  onCopyPublicLink,
}: MapCardProps) {
  const formattedDate = formatDate(map.createdAt);
  const previewUrl = generateMapPreview(map);
  const visibility = map.visibility ?? 'private';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 hover:border-amber-300 hover:-translate-y-1">
      <Link href={`/map/${map.id}`} className="block group">
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
      </Link>
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-3 flex items-center gap-2">
          <label htmlFor={`visibility-${map.id}`} className="text-xs font-medium text-gray-600 shrink-0">
            Visibility
          </label>
          <select
            id={`visibility-${map.id}`}
            value={visibility}
            onChange={(e) => onVisibilityChange?.(map.id, e.target.value as MapVisibility)}
            disabled={isUpdatingVisibility}
            className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-70"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
          </select>
          {visibility === 'public' && (
            <button
              type="button"
              onClick={() => onCopyPublicLink?.(map.id)}
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-amber-700 border border-amber-200 hover:bg-amber-100 transition whitespace-nowrap"
            >
              Copy Link
            </button>
          )}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200" />
    </div>
  );
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return 'Unknown date';
  try {
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    if (timestamp instanceof Date) return timestamp.toLocaleDateString('ja-JP', opts);
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate().toLocaleDateString('ja-JP', opts);
    }
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
