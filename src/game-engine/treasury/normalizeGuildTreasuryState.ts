import type { GuildTreasuryState, GuildTreasuryTransaction, GuildTreasuryTransactionType } from "../../shared/types";

export const GUILD_TREASURY_HISTORY_LIMIT = 30;
export const MAX_GUILD_GOLD = Number.MAX_SAFE_INTEGER;

export function createDefaultGuildTreasuryState(): GuildTreasuryState {
  return { reservedGold: 0, totalDeposited: 0, totalWithdrawn: 0, transactions: [] };
}

export function normalizeGuildTreasuryState(value: unknown): GuildTreasuryState {
  if (!value || typeof value !== "object") return createDefaultGuildTreasuryState();
  const candidate = value as Partial<GuildTreasuryState>;
  const transactions = Array.isArray(candidate.transactions)
    ? candidate.transactions.map(normalizeTransaction).filter((entry): entry is GuildTreasuryTransaction => Boolean(entry)).slice(0, GUILD_TREASURY_HISTORY_LIMIT)
    : [];
  return {
    reservedGold: normalizeInteger(candidate.reservedGold),
    totalDeposited: normalizeInteger(candidate.totalDeposited),
    totalWithdrawn: normalizeInteger(candidate.totalWithdrawn),
    transactions,
  };
}

export function normalizeGold(value: unknown) {
  return normalizeInteger(value);
}

function normalizeTransaction(value: unknown): GuildTreasuryTransaction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildTreasuryTransaction>;
  if (typeof candidate.id !== "string" || !candidate.id || !isTransactionType(candidate.type)) return undefined;
  const amount = normalizeInteger(candidate.amount);
  const createdAt = typeof candidate.createdAt === "string" && Number.isFinite(Date.parse(candidate.createdAt)) ? candidate.createdAt : undefined;
  if (amount <= 0 || !createdAt) return undefined;
  return { id: candidate.id, type: candidate.type, amount, balanceAfter: normalizeInteger(candidate.balanceAfter), createdAt };
}

function isTransactionType(value: unknown): value is GuildTreasuryTransactionType {
  return value === "deposit" || value === "withdrawal";
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(MAX_GUILD_GOLD, Math.max(0, Math.floor(parsed))) : 0;
}
