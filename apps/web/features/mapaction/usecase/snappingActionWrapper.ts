export interface PointPx {
  x: number;
  y: number;
}

/** A concrete snap candidate resolved into screen-space pixels. */
export interface SnapTarget {
  id: string;
  pointPx: PointPx;
  priority?: number;
}

/** Tunable thresholds for the snapping state machine (all in pixel space). */
export interface SnappingThresholdConfig {
  /** Velocity above this value bypasses all snapping checks for smooth fast drags. */
  vBypassMaxPxPerMs: number;
  /** Velocity must stay below this value while dwelling in Rin. */
  vDwellMaxPxPerMs: number;
  /** Enter radius for dwell candidate. */
  rInPx: number;
  /** Exit radius for snapped detachment. Must be > rInPx. */
  rOutPx: number;
  /** Time required inside Rin at low speed before lock-on. */
  dwellMs: number;
}

/** Last velocity sample, updated on every move tick. */
export interface VelocitySample {
  pointerPx: PointPx;
  tsMs: number;
  speedPxPerMs: number;
}

export type SnapPhase = 'free' | 'candidate' | 'snapped';

/**
 * Wrapper runtime state.
 * - objectPx: the actual rendered object point (e.g. pin tip).
 * - grabOffsetPx: pointer - object anchor used for free-drag continuity.
 */
export interface SnappingActionState {
  phase: SnapPhase;
  objectPx: PointPx;
  grabOffsetPx: PointPx;
  velocity: VelocitySample | null;
  candidate: { targetId: string; sinceMs: number } | null;
  snappedTargetId: string | null;
}

export interface MoveSnappingActionInput {
  state: SnappingActionState;
  pointerPx: PointPx;
  nowMs: number;
  targets: SnapTarget[];
  config: SnappingThresholdConfig;
}

export interface MoveSnappingActionResult {
  state: SnappingActionState;
  objectPx: PointPx;
  phase: SnapPhase;
  isSnapped: boolean;
  activeTargetId: string | null;
  speedPxPerMs: number;
}

export const DEFAULT_SNAPPING_THRESHOLD_CONFIG: SnappingThresholdConfig = {
  vBypassMaxPxPerMs: 1.2,
  vDwellMaxPxPerMs: 0.08,
  rInPx: 40,
  rOutPx: 65,
  dwellMs: 100,
};

/** Creates a fresh drag state from the initial pointer/object relation. */
export function createSnappingActionState(
  pointerPx: PointPx,
  objectPx: PointPx = pointerPx,
  nowMs: number = Date.now(),
): SnappingActionState {
  return {
    phase: 'free',
    objectPx,
    grabOffsetPx: subtract(pointerPx, objectPx),
    velocity: {
      pointerPx,
      tsMs: nowMs,
      speedPxPerMs: 0,
    },
    candidate: null,
    snappedTargetId: null,
  };
}

export function moveSnappingAction(input: MoveSnappingActionInput): MoveSnappingActionResult {
  const config = normalizeConfig(input.config);
  const velocity = nextVelocity(input.state.velocity, input.pointerPx, input.nowMs);
  const speed = velocity.speedPxPerMs;

  // Nearest target is selected by priority first, then by distance.
  const nearest = findNearestTarget(input.pointerPx, input.targets);

  if (input.state.phase === 'snapped') {
    // While snapped, object stays locked to target's current screen point.
    const snappedTarget = findTargetById(input.targets, input.state.snappedTargetId);
    const objectPx = snappedTarget?.pointPx ?? input.state.objectPx;
    const detachDistance = distance(input.pointerPx, objectPx);

    if (detachDistance >= config.rOutPx) {
      /**
       * Smooth Detach:
       * Re-anchor grab offset at detach moment so object position does not jump.
       * After this reset, free-drag formula (object = pointer - offset) yields
       * exactly the same objectPx for the first detached frame.
       */
      const newGrabOffsetPx = subtract(input.pointerPx, objectPx);
      const detachedState: SnappingActionState = {
        phase: 'free',
        objectPx,
        grabOffsetPx: newGrabOffsetPx,
        velocity,
        candidate: null,
        snappedTargetId: null,
      };
      return {
        state: detachedState,
        objectPx,
        phase: detachedState.phase,
        isSnapped: false,
        activeTargetId: null,
        speedPxPerMs: speed,
      };
    }

    const nextState: SnappingActionState = {
      ...input.state,
      objectPx,
      velocity,
    };
    return {
      state: nextState,
      objectPx,
      phase: 'snapped',
      isSnapped: true,
      activeTargetId: nextState.snappedTargetId,
      speedPxPerMs: speed,
    };
  }

  // Velocity bypass: fast movements should never feel "sticky".
  if (speed > config.vBypassMaxPxPerMs) {
    const objectPx = subtract(input.pointerPx, input.state.grabOffsetPx);
    const nextState: SnappingActionState = {
      ...input.state,
      phase: 'free',
      objectPx,
      velocity,
      candidate: null,
      snappedTargetId: null,
    };
    return {
      state: nextState,
      objectPx,
      phase: 'free',
      isSnapped: false,
      activeTargetId: null,
      speedPxPerMs: speed,
    };
  }

  // Only low-speed movement inside Rin can enter/maintain dwell candidate.
  if (!nearest || nearest.distancePx > config.rInPx || speed > config.vDwellMaxPxPerMs) {
    const objectPx = subtract(input.pointerPx, input.state.grabOffsetPx);
    const nextState: SnappingActionState = {
      ...input.state,
      phase: 'free',
      objectPx,
      velocity,
      candidate: null,
      snappedTargetId: null,
    };
    return {
      state: nextState,
      objectPx,
      phase: 'free',
      isSnapped: false,
      activeTargetId: null,
      speedPxPerMs: speed,
    };
  }

  const candidate = input.state.candidate;
  const isSameCandidate = candidate?.targetId === nearest.target.id;
  const sinceMs = isSameCandidate ? candidate.sinceMs : input.nowMs;
  const dwellElapsedMs = input.nowMs - sinceMs;

  // Dwell-to-snap: lock object to target after sustained low-speed proximity.
  if (dwellElapsedMs >= config.dwellMs) {
    const snappedState: SnappingActionState = {
      ...input.state,
      phase: 'snapped',
      objectPx: nearest.target.pointPx,
      velocity,
      candidate: null,
      snappedTargetId: nearest.target.id,
    };
    return {
      state: snappedState,
      objectPx: snappedState.objectPx,
      phase: 'snapped',
      isSnapped: true,
      activeTargetId: snappedState.snappedTargetId,
      speedPxPerMs: speed,
    };
  }

  const candidateState: SnappingActionState = {
    ...input.state,
    phase: 'candidate',
    objectPx: subtract(input.pointerPx, input.state.grabOffsetPx),
    velocity,
    candidate: { targetId: nearest.target.id, sinceMs },
    snappedTargetId: null,
  };
  return {
    state: candidateState,
    objectPx: candidateState.objectPx,
    phase: 'candidate',
    isSnapped: false,
    activeTargetId: nearest.target.id,
    speedPxPerMs: speed,
  };
}

function findTargetById(targets: SnapTarget[], id: string | null): SnapTarget | null {
  if (!id) return null;
  return targets.find((t) => t.id === id) ?? null;
}

/** Picks best target by priority, then nearest distance as tie-breaker. */
function findNearestTarget(pointerPx: PointPx, targets: SnapTarget[]) {
  let best: { target: SnapTarget; distancePx: number } | null = null;
  for (const target of targets) {
    const d = distance(pointerPx, target.pointPx);
    if (!best) {
      best = { target, distancePx: d };
      continue;
    }
    const bestPriority = best.target.priority ?? 0;
    const currentPriority = target.priority ?? 0;
    if (currentPriority > bestPriority) {
      best = { target, distancePx: d };
      continue;
    }
    if (currentPriority === bestPriority && d < best.distancePx) {
      best = { target, distancePx: d };
    }
  }
  return best;
}

/** Per-frame velocity estimator in px/ms. */
function nextVelocity(
  previous: VelocitySample | null,
  pointerPx: PointPx,
  nowMs: number,
): VelocitySample {
  if (!previous) {
    return { pointerPx, tsMs: nowMs, speedPxPerMs: 0 };
  }
  const dt = Math.max(nowMs - previous.tsMs, 1);
  const speedPxPerMs = distance(pointerPx, previous.pointerPx) / dt;
  return { pointerPx, tsMs: nowMs, speedPxPerMs };
}

/** Keeps thresholds in a safe range (notably enforcing Rout > Rin). */
function normalizeConfig(config: SnappingThresholdConfig): SnappingThresholdConfig {
  const rInPx = Math.max(config.rInPx, 1);
  const rOutPx = Math.max(config.rOutPx, rInPx + 1);
  return {
    vBypassMaxPxPerMs: Math.max(config.vBypassMaxPxPerMs, 0),
    vDwellMaxPxPerMs: Math.max(config.vDwellMaxPxPerMs, 0),
    rInPx,
    rOutPx,
    dwellMs: Math.max(config.dwellMs, 1),
  };
}

function subtract(a: PointPx, b: PointPx): PointPx {
  return { x: a.x - b.x, y: a.y - b.y };
}

function distance(a: PointPx, b: PointPx): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
