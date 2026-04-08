import {
  BALANCED_OBJECT_MAGNET_CONFIG,
  INITIAL_OBJECT_MAGNET_SESSION,
  resolveObjectMagnet,
  type ObjectMagnetConfig,
  type ObjectMagnetSession,
  type ScreenPoint,
} from './objectMagnet';

export const MOBILE_DRAG_OFFSET_Y = 60;
export const DESKTOP_DRAG_OFFSET_Y = 24;

export type MagnetHint = 'none' | 'attached';

export interface DragPhysicsState {
  dropInsideMap: boolean;
  magnetSession: ObjectMagnetSession;
  magnetHint: MagnetHint;
}

export interface ResolveDragObjectMoveInput {
  pointerClient: ScreenPoint;
  offsetY: number;
  magnetTarget: ScreenPoint | null;
  magnetSession: ObjectMagnetSession;
  isDropInsideMapAtTip: (tipClient: ScreenPoint) => boolean;
  magnetConfig?: ObjectMagnetConfig;
}

export interface ResolveDragObjectMoveResult extends DragPhysicsState {
  overlayPosition: ScreenPoint;
  adjustedTip: ScreenPoint;
}

export interface ResolveDragObjectEndInput {
  pointerClient: ScreenPoint;
  offsetY: number;
  magnetTarget: ScreenPoint | null;
  magnetSession: ObjectMagnetSession;
  isDropInsideMapAtTip: (tipClient: ScreenPoint) => boolean;
  magnetConfig?: ObjectMagnetConfig;
}

export interface ResolveDragObjectEndResult extends DragPhysicsState {
  finalTip: ScreenPoint;
}

export const INITIAL_DRAG_PHYSICS_STATE: DragPhysicsState = {
  dropInsideMap: true,
  magnetSession: INITIAL_OBJECT_MAGNET_SESSION,
  magnetHint: 'none',
};

export function createInitialDragPhysicsState(): DragPhysicsState {
  return {
    dropInsideMap: true,
    magnetSession: { ...INITIAL_OBJECT_MAGNET_SESSION },
    magnetHint: 'none',
  };
}

export function getDragOffsetY(isMobile: boolean): number {
  return isMobile ? MOBILE_DRAG_OFFSET_Y : DESKTOP_DRAG_OFFSET_Y;
}

export function resolveDragObjectMove(
  input: ResolveDragObjectMoveInput,
): ResolveDragObjectMoveResult {
  const magnetConfig = input.magnetConfig ?? BALANCED_OBJECT_MAGNET_CONFIG;
  const rawTip = {
    x: input.pointerClient.x,
    y: input.pointerClient.y - input.offsetY,
  };
  const magnet = resolveObjectMagnet({
    pointer: rawTip,
    target: input.magnetTarget,
    session: input.magnetSession,
    config: magnetConfig,
  });

  const adjustedTip = magnet.adjustedPointer;
  const overlayPosition = {
    x: adjustedTip.x,
    y: adjustedTip.y + input.offsetY,
  };

  return {
    overlayPosition,
    adjustedTip,
    dropInsideMap: input.isDropInsideMapAtTip(adjustedTip),
    magnetSession: magnet.session,
    magnetHint: magnet.isAttached ? 'attached' : 'none',
  };
}

export function resolveDragObjectEnd(
  input: ResolveDragObjectEndInput,
): ResolveDragObjectEndResult {
  const magnetConfig = input.magnetConfig ?? BALANCED_OBJECT_MAGNET_CONFIG;
  const rawTip = {
    x: input.pointerClient.x,
    y: input.pointerClient.y - input.offsetY,
  };
  const magnet = resolveObjectMagnet({
    pointer: rawTip,
    target: input.magnetTarget,
    session: input.magnetSession,
    config: magnetConfig,
  });
  const finalTip = magnet.isAttached ? magnet.adjustedPointer : rawTip;

  return {
    finalTip,
    dropInsideMap: input.isDropInsideMapAtTip(finalTip),
    magnetSession: magnet.session,
    magnetHint: magnet.isAttached ? 'attached' : 'none',
  };
}
