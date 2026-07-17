export const BAZAAR_ROTATION_MS = 10 * 60 * 1000;

export function getBazaarRotationKey(now = new Date()) {
  const timestamp = Number.isFinite(now.getTime()) ? now.getTime() : Date.now();
  return String(Math.floor(timestamp / BAZAAR_ROTATION_MS));
}

export function getBazaarRotationBounds(rotationKey: string) {
  const rotationIndex = Number(rotationKey);
  const safeIndex = Number.isSafeInteger(rotationIndex) && rotationIndex >= 0
    ? rotationIndex
    : Math.floor(Date.now() / BAZAAR_ROTATION_MS);

  return {
    generatedAt: new Date(safeIndex * BAZAAR_ROTATION_MS).toISOString(),
    expiresAt: new Date((safeIndex + 1) * BAZAAR_ROTATION_MS).toISOString(),
  };
}
