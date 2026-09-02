# Boss Trophy Hall: Tauri/SQLite QA

## Automated Checks

From the repository root, with port 1420 available:

```powershell
npm run build
npm run tauri:dev -- --config "$PWD/qa/tauri.boss-trophy-hall.json"
```

The dedicated page runs `runStage1655Qa` once and displays the result. It requires
Tauri: opening this page in an ordinary browser cannot test the SQL Plugin.
Close the QA application after the run. Normal startup remains `npm run tauri:dev`.

The runner resets only its dedicated `stage1655_20260902.db` in the application
data directory. Never use that database for player progress. It uses production
migrations, repository, mapper and game-engine functions, and closes its SQL
connection when finished. It never opens `guild_hunt_idle.db` or mounts `App`.
The test page is not an entry point of the production Vite build.

## Coverage

- Old save without Trophy Hall, retroactive eligibility and no automatic claims.
- Six Bosses, 18 unlocks and a save/reload between every claim.
- Tier order, locked/unknown rewards and duplicates before/after reload.
- Persisted ledger, dates, history, Collection unlocks and new-item flags.
- No changes to gold, Renown, depot or sibling operation outcomes from claims.
- Raw SQLite verification of all 18 claims and all 18 new-item flags.
- Avatar, outfit and mount equipment persisted through save/reload.
- Seen flags remain cleared; duplicates do not recreate flags or logs.
- Already-unlocked cosmetic archived without duplicate unlock or badge.
- New Boss result preserves prior trophy claims through save/reload.
- Malformed ledger/history inserted with SQL normalizes on load.

On 2026-09-02, both runs passed **114/114** checks. The first used a temporary
entry point; the second validated this reusable isolated entry point. Reports
are appended to `stage1655_report` in the QA database.

## Interactive Checks

The automated checks validate state and persistence, not rendered interactions.
Use a separate QA save with retroactive Boss progress; never seed a player's save.

1. Open Explorar > Bosses and select a Trophy Hall wing.
2. Verify that the selected wing and Raid Codex refer to the same Boss.
3. Claim Conquered and verify Archived plus the Collections badge.
4. Claim Mastered and Flawless in order, checking that prior claims stay disabled.
5. Save and Reload through the normal UI; confirm claims remain archived.
6. Open Collections and verify the cosmetics and clearing of the visible badge.
7. Repeat at the Tauri minimum window size and check clipping/overlap.

The first attempt was interrupted by another window taking focus. A later
authorized session completed this click-through on 2026-09-02 using the normal
application connected temporarily to the isolated QA database. The connection
change was reverted before committing.

Khazgrim Gatekeeper was selected in the Hall and verified in the Raid Codex.
All three rewards were claimed in order, including a double-click on Conquered.
The UI showed 3/3 archived and a Collections badge of 3. Save/Reload preserved
the claims; each cosmetic appeared unlocked in its category. Opening Collections
cleared the badge, and a second Save/Reload kept it cleared.

The Hall was inspected at 1280x800 and the minimum 960x640 client area.
Collections was inspected maximized. The Ironhorn preview overflow found there
was fixed with bounded wrapping in catalog, showcase and trophy previews; catalog
and showcase were visually rechecked after the fix.

An independent SQLite read confirmed three unique claim IDs/history entries,
three cosmetic unlocks, zero pending new-item flags, six expected trophy/unlock
log entries, and unchanged 420 gold. The player database SHA-256 remained
`E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`.
The automated 114-check suite was not rerun in this interactive continuation.
