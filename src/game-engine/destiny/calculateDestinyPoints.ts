export function calculateDestinyPoints(characterLevel: number) {
  const level = Number.isFinite(characterLevel) ? Math.max(1, Math.floor(characterLevel)) : 1;

  if (level < 10) return 0;

  return Math.floor((level - 10) / 5) + 1;
}
