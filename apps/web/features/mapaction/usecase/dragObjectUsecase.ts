import {
  createSnappingActionState,
  DEFAULT_SNAPPING_THRESHOLD_CONFIG,
  moveSnappingAction,
  type PointPx,
  type SnapTarget,
  type SnappingActionState,
  type SnappingThresholdConfig,
} from './snappingActionWrapper';

export const MOBILE_DRAG_OFFSET_Y = 60;
export const DESKTOP_DRAG_OFFSET_Y = 24;

export type MagnetHint = 'none' | 'attached';

export interface DragPhysicsState {
  dropInsideMap: boolean;
  snappingState: SnappingActionState | null;
  magnetHint: MagnetHint;
}

export interface ResolveDragObjectMoveInput {
  pointerClient: PointPx;
  offsetY: number;
  snapTargets: SnapTarget[];
  snappingState: SnappingActionState | null;
  isDropInsideMapAtTip: (tipClient: PointPx) => boolean;
  thresholdConfig?: SnappingThresholdConfig;
  nowMs?: number;
}

export interface ResolveDragObjectMoveResult extends DragPhysicsState {
  overlayPosition: PointPx;
  adjustedTip: PointPx;
}

export interface ResolveDragObjectEndInput {
  pointerClient: PointPx;
  offsetY: number;
  snapTargets: SnapTarget[];
  snappingState: SnappingActionState | null;
  isDropInsideMapAtTip: (tipClient: PointPx) => boolean;
  thresholdConfig?: SnappingThresholdConfig;
  nowMs?: number;
}

export interface ResolveDragObjectEndResult extends DragPhysicsState {
  finalTip: PointPx;
}

export const INITIAL_DRAG_PHYSICS_STATE: DragPhysicsState = {
  dropInsideMap: true,
  snappingState: null,
  magnetHint: 'none',
};

export function createInitialDragPhysicsState(): DragPhysicsState {
  return {
    dropInsideMap: true,
    snappingState: null,
    magnetHint: 'none',
  };
}

export function getDragOffsetY(isMobile: boolean): number {
  return isMobile ? MOBILE_DRAG_OFFSET_Y : DESKTOP_DRAG_OFFSET_Y;
}

export function resolveDragObjectMove(
  input: ResolveDragObjectMoveInput,
): ResolveDragObjectMoveResult {
  const nowMs = input.nowMs ?? Date.now();
  const pointerTip = {
    x: input.pointerClient.x,
    y: input.pointerClient.y - input.offsetY,
  };
  const nextState =
    input.snappingState ?? createSnappingActionState(pointerTip, pointerTip, nowMs);
  const snap = moveSnappingAction({
    state: nextState,
    pointerPx: pointerTip,
    nowMs,
    targets: input.snapTargets,
    config: input.thresholdConfig ?? DEFAULT_SNAPPING_THRESHOLD_CONFIG,
  });

  const adjustedTip = snap.objectPx;
  const overlayPosition = {
    x: adjustedTip.x,
    y: adjustedTip.y + input.offsetY,
  };

  return {
    overlayPosition,
    adjustedTip,
    dropInsideMap: input.isDropInsideMapAtTip(adjustedTip),
    snappingState: snap.state,
    magnetHint: snap.isSnapped ? 'attached' : 'none',
  };
}

export function resolveDragObjectEnd(
  input: ResolveDragObjectEndInput,
): ResolveDragObjectEndResult {
  const nowMs = input.nowMs ?? Date.now();
  const pointerTip = {
    x: input.pointerClient.x,
    y: input.pointerClient.y - input.offsetY,
  };
  const nextState =
    input.snappingState ?? createSnappingActionState(pointerTip, pointerTip, nowMs);
  const snap = moveSnappingAction({
    state: nextState,
    pointerPx: pointerTip,
    nowMs,
    targets: input.snapTargets,
    config: input.thresholdConfig ?? DEFAULT_SNAPPING_THRESHOLD_CONFIG,
  });
  const finalTip = snap.objectPx;

  return {
    finalTip,
    dropInsideMap: input.isDropInsideMapAtTip(finalTip),
    snappingState: snap.state,
    magnetHint: snap.isSnapped ? 'attached' : 'none',
  };
}
