// ── Client SDK ──────────────────────────────────────────────
export { app, auth, db, storage } from './client';

// ── Converters ──────────────────────────────────────────────
export { userConverter } from './converters/userConverter';
export { mapConverter } from './converters/mapConverter';
export { pinConverter } from './converters/pinConverter';

// ── Repositories ────────────────────────────────────────────
export {
  getUserById,
  createUser,
  updateUser,
} from './repositories/userRepository';

export {
  getMapById,
  listMapsByOwner,
  createMap,
  adjustPinCount,
  type MapWithId,
} from './repositories/mapRepository';

export {
  createPin,
  subscribePins,
  type PinWithId,
} from './repositories/pinRepository';

// ── Schemas (Zod) ───────────────────────────────────────────
export {
  userDocSchema,
  createUserInputSchema,
  mapDocSchema,
  createMapInputSchema,
  pinDocSchema,
  pinColorSchema,
  pinIconTypeSchema,
  createPinInputSchema,
} from './schema';
