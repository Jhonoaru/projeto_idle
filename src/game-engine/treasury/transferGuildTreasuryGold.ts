import type { Guild, GuildTreasuryTransactionType } from "../../shared/types";
import { GUILD_TREASURY_HISTORY_LIMIT, MAX_GUILD_GOLD, normalizeGold, normalizeGuildTreasuryState } from "./normalizeGuildTreasuryState";

export function depositGuildGold(guild: Guild, amount: number, now = new Date()) {
  return transferGuildTreasuryGold(guild, amount, "deposit", now);
}

export function withdrawGuildGold(guild: Guild, amount: number, now = new Date()) {
  return transferGuildTreasuryGold(guild, amount, "withdrawal", now);
}

function transferGuildTreasuryGold(guild: Guild, amount: number, type: GuildTreasuryTransactionType, now: Date) {
  const treasury = normalizeGuildTreasuryState(guild.treasury);
  const spendableGold = normalizeGold(guild.gold);
  const transferAmount = normalizeTransferAmount(amount);
  if (transferAmount === 0) return blocked(guild, "Enter a whole gold amount greater than zero.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, "Treasury timestamp is invalid.");
  if (type === "deposit" && transferAmount > spendableGold) return blocked(guild, "The guild does not have enough spendable gold.");
  if (type === "withdrawal" && transferAmount > treasury.reservedGold) return blocked(guild, "The protected reserve does not hold enough gold.");
  if (type === "deposit" && treasury.reservedGold > MAX_GUILD_GOLD - transferAmount) return blocked(guild, "The protected reserve has reached its local limit.");
  if (type === "withdrawal" && spendableGold > MAX_GUILD_GOLD - transferAmount) return blocked(guild, "Spendable guild gold has reached its local limit.");

  const transactionId = `treasury-${type}-${now.getTime()}`;
  if (treasury.transactions.some((entry) => entry.id === transactionId)) return blocked(guild, "This treasury transfer was already recorded.");

  const reservedGold = type === "deposit" ? treasury.reservedGold + transferAmount : treasury.reservedGold - transferAmount;
  const nextSpendableGold = type === "deposit" ? spendableGold - transferAmount : spendableGold + transferAmount;
  const transaction = { id: transactionId, type, amount: transferAmount, balanceAfter: reservedGold, createdAt: now.toISOString() };
  const nextTreasury = {
    reservedGold,
    totalDeposited: Math.min(MAX_GUILD_GOLD, treasury.totalDeposited + (type === "deposit" ? transferAmount : 0)),
    totalWithdrawn: Math.min(MAX_GUILD_GOLD, treasury.totalWithdrawn + (type === "withdrawal" ? transferAmount : 0)),
    transactions: [transaction, ...treasury.transactions].slice(0, GUILD_TREASURY_HISTORY_LIMIT),
  };
  return {
    success: true,
    guild: { ...guild, gold: nextSpendableGold, treasury: nextTreasury },
    message: `${transferAmount.toLocaleString("en-US")}g ${type === "deposit" ? "moved into the protected reserve" : "returned to spendable guild funds"}.`,
    type,
    amount: transferAmount,
  };
}

function normalizeTransferAmount(value: number) {
  return Number.isFinite(value) && Number.isInteger(value) && value > 0 && value <= MAX_GUILD_GOLD ? value : 0;
}

function blocked(guild: Guild, message: string) {
  return { success: false, guild, message, type: undefined, amount: 0 };
}
