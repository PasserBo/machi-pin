import type { PointPx, SnapTarget } from '@/features/mapaction/usecase/snappingActionWrapper';

export interface DynamicSnapTargetSource {
  id: string;
  priority?: number;
  getScreenPoint: (nowMs: number) => PointPx | null;
}

export function resolveActiveSnapTargets(
  sources: DynamicSnapTargetSource[],
  nowMs: number = Date.now(),
): SnapTarget[] {
  const targets: SnapTarget[] = [];
  for (const source of sources) {
    const pointPx = source.getScreenPoint(nowMs);
    if (!pointPx) continue;
    targets.push({
      id: source.id,
      priority: source.priority,
      pointPx,
    });
  }
  return targets;
}
