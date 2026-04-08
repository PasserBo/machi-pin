export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ObjectMagnetSession {
  isAttached: boolean;
  lockedUntilReset: boolean;
  attachedPointer: ScreenPoint | null;
}

export interface ObjectMagnetConfig {
  mediumRadiusPx: number;
  resetMultiplier: number;
  maxShiftRatio: number;
  detachMoveThresholdPx: number;
}

export interface ResolveObjectMagnetInput {
  pointer: ScreenPoint;
  target: ScreenPoint | null;
  session: ObjectMagnetSession;
  config: ObjectMagnetConfig;
}

export interface ResolveObjectMagnetResult {
  adjustedPointer: ScreenPoint;
  session: ObjectMagnetSession;
  isAttached: boolean;
  influence: number;
  resetRadiusPx: number;
}

export const BALANCED_OBJECT_MAGNET_CONFIG: ObjectMagnetConfig = {
  mediumRadiusPx: 72,
  resetMultiplier: 1.8,
  maxShiftRatio: 0.58,
  detachMoveThresholdPx: 14,
};

export const INITIAL_OBJECT_MAGNET_SESSION: ObjectMagnetSession = {
  isAttached: false,
  lockedUntilReset: false,
  attachedPointer: null,
};

export function getMagnetResetRadiusPx(config: ObjectMagnetConfig): number {
  return Math.max(config.mediumRadiusPx * config.resetMultiplier, config.mediumRadiusPx + 1);
}

export function resolveObjectMagnet({
  pointer,
  target,
  session,
  config,
}: ResolveObjectMagnetInput): ResolveObjectMagnetResult {
  const resetRadiusPx = getMagnetResetRadiusPx(config);
  if (!target) {
    return {
      adjustedPointer: pointer,
      session: { ...INITIAL_OBJECT_MAGNET_SESSION },
      isAttached: false,
      influence: 0,
      resetRadiusPx,
    };
  }

  const dist = distance(pointer, target);
  const unlockNow = session.lockedUntilReset && dist >= resetRadiusPx;
  const unlockedSession = unlockNow
    ? { isAttached: false, lockedUntilReset: false, attachedPointer: null }
    : session;

  if (unlockedSession.lockedUntilReset) {
    return {
      adjustedPointer: pointer,
      session: { ...unlockedSession, isAttached: false },
      isAttached: false,
      influence: 0,
      resetRadiusPx,
    };
  }

  if (unlockedSession.isAttached) {
    const anchor = unlockedSession.attachedPointer ?? pointer;
    const movedDistance = distance(pointer, anchor);
    if (movedDistance > config.detachMoveThresholdPx) {
      return {
        adjustedPointer: pointer,
        session: {
          isAttached: false,
          lockedUntilReset: true,
          attachedPointer: null,
        },
        isAttached: false,
        influence: 0,
        resetRadiusPx,
      };
    }

    const attachedInfluence = influenceFromDistance(dist, config.mediumRadiusPx);
    return {
      adjustedPointer: lerpToward(pointer, target, attachedInfluence * config.maxShiftRatio),
      session: { ...unlockedSession, isAttached: true, attachedPointer: anchor },
      isAttached: true,
      influence: attachedInfluence,
      resetRadiusPx,
    };
  }

  if (dist <= config.mediumRadiusPx) {
    const influence = influenceFromDistance(dist, config.mediumRadiusPx);
    return {
      adjustedPointer: lerpToward(pointer, target, influence * config.maxShiftRatio),
      session: {
        isAttached: true,
        lockedUntilReset: false,
        attachedPointer: pointer,
      },
      isAttached: true,
      influence,
      resetRadiusPx,
    };
  }

  return {
    adjustedPointer: pointer,
    session: {
      isAttached: false,
      lockedUntilReset: false,
      attachedPointer: null,
    },
    isAttached: false,
    influence: 0,
    resetRadiusPx,
  };
}

function influenceFromDistance(distancePx: number, mediumRadiusPx: number): number {
  const normalized = clamp01(1 - distancePx / Math.max(mediumRadiusPx, 1));
  return 0.24 + normalized * 0.76;
}

function lerpToward(from: ScreenPoint, to: ScreenPoint, t: number): ScreenPoint {
  const ratio = clamp01(t);
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function distance(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp01(v: number): number {
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}
