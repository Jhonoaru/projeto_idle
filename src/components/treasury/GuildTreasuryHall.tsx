import { useMemo, useState } from "react";
import { normalizeGold, normalizeGuildTreasuryState } from "../../game-engine/treasury/normalizeGuildTreasuryState";
import type { Guild, GuildTreasuryTransactionType } from "../../shared/types";

interface GuildTreasuryHallProps {
  guild: Guild;
  onTransfer: (type: GuildTreasuryTransactionType, amount: number) => void;
}

const amountPresets = [100, 500, 1_000];

export function GuildTreasuryHall({ guild, onTransfer }: GuildTreasuryHallProps) {
  const treasury = useMemo(() => normalizeGuildTreasuryState(guild.treasury), [guild.treasury]);
  const spendableGold = normalizeGold(guild.gold);
  const [mode, setMode] = useState<GuildTreasuryTransactionType>("deposit");
  const [amount, setAmount] = useState("100");
  const parsedAmount = Number(amount);
  const sourceBalance = mode === "deposit" ? spendableGold : treasury.reservedGold;
  const validAmount = Number.isInteger(parsedAmount) && parsedAmount > 0 && parsedAmount <= sourceBalance;
  const holdings = spendableGold + treasury.reservedGold;

  function selectMaximum() {
    setAmount(String(sourceBalance));
  }

  return (
    <div className="treasury-hall">
      <section className="treasury-hero">
        <div className="treasury-vault-mark" aria-hidden="true"><i>G</i><span>LOCAL VAULT</span></div>
        <div className="treasury-identity">
          <span>Guild Treasury</span>
          <h3>{guild.name} Reserve</h3>
          <p>Set aside part of the guild's existing gold. Reserved funds remain local and protected from ordinary purchases until withdrawn.</p>
        </div>
        <div className="treasury-summary">
          <Summary label="Spendable" value={`${spendableGold.toLocaleString("en-US")}g`} />
          <Summary label="Protected" value={`${treasury.reservedGold.toLocaleString("en-US")}g`} />
          <Summary label="Total holdings" value={`${holdings.toLocaleString("en-US")}g`} />
          <Summary label="Ledger entries" value={`${treasury.transactions.length}/30`} />
        </div>
      </section>

      <div className="treasury-workspace">
        <section className="treasury-transfer-panel">
          <header><span>Vault Counter</span><strong>Move guild funds</strong></header>
          <div className="treasury-segmented" aria-label="Transfer direction">
            <button aria-pressed={mode === "deposit"} onClick={() => setMode("deposit")} type="button">Deposit</button>
            <button aria-pressed={mode === "withdrawal"} onClick={() => setMode("withdrawal")} type="button">Withdraw</button>
          </div>
          <div className="treasury-balance-route">
            <Balance label={mode === "deposit" ? "Guild funds" : "Protected reserve"} value={sourceBalance} />
            <span aria-hidden="true">{mode === "deposit" ? ">" : "<"}</span>
            <Balance label={mode === "deposit" ? "Protected reserve" : "Guild funds"} value={mode === "deposit" ? treasury.reservedGold : spendableGold} />
          </div>
          <label className="treasury-amount-field">
            <span>Gold amount</span>
            <input min="1" onChange={(event) => setAmount(event.target.value)} step="1" type="number" value={amount} />
          </label>
          <div className="treasury-presets">
            {amountPresets.map((preset) => <button disabled={preset > sourceBalance} key={preset} onClick={() => setAmount(String(preset))} type="button">{preset.toLocaleString("en-US")}g</button>)}
            <button disabled={sourceBalance <= 0} onClick={selectMaximum} type="button">Max</button>
          </div>
          <div className="treasury-preview">
            <span>Reserve after transfer</span>
            <strong>{validAmount ? (mode === "deposit" ? treasury.reservedGold + parsedAmount : treasury.reservedGold - parsedAmount).toLocaleString("en-US") : treasury.reservedGold.toLocaleString("en-US")}g</strong>
          </div>
          <button className="treasury-command" disabled={!validAmount} onClick={() => onTransfer(mode, parsedAmount)} type="button">
            {mode === "deposit" ? "Deposit into Reserve" : "Withdraw to Guild Funds"}
          </button>
          <small className="treasury-local-note">Transfers have no fee, interest, premium currency or online service. The reserve does not generate income.</small>
        </section>

        <section className="treasury-ledger">
          <header><span>Account Ledger</span><strong>Recent local transfers</strong></header>
          <div className="treasury-lifetime">
            <Summary label="Lifetime deposited" value={`${treasury.totalDeposited.toLocaleString("en-US")}g`} />
            <Summary label="Lifetime withdrawn" value={`${treasury.totalWithdrawn.toLocaleString("en-US")}g`} />
          </div>
          <div className="treasury-ledger-list">
            {treasury.transactions.length === 0 ? <div className="treasury-empty-ledger"><strong>No transfers recorded</strong><small>The first vault operation will appear here.</small></div> : treasury.transactions.map((entry) => (
              <article className={`treasury-entry is-${entry.type}`} key={entry.id}>
                <i>{entry.type === "deposit" ? "+" : "-"}</i>
                <span><strong>{entry.type === "deposit" ? "Reserve deposit" : "Reserve withdrawal"}</strong><small>{formatDate(entry.createdAt)}</small></span>
                <span><b>{entry.amount.toLocaleString("en-US")}g</b><small>Balance {entry.balanceAfter.toLocaleString("en-US")}g</small></span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Balance({ label, value }: { label: string; value: number }) {
  return <div><span>{label}</span><strong>{value.toLocaleString("en-US")}g</strong></div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
