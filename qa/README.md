# Boss Trophy Hall: Tauri/SQLite QA

## Stage 170.5: Hunt Motion Tauri/SQLite QA

From the repository root, run:

```powershell
npm run tauri:dev -- --config "$PWD/qa/tauri.hunt-motion.json"
```

The dedicated page uses `stage1705_20260904.db`, production migrations and the
real repository. It persists active and completed hunts for all five vocations,
checks raw action JSON and local artwork, restores the active state, then writes
WebView animation/reduced-motion evidence to `stage1705_report`. Controls allow
manual switching between vocations, Active/Completed and Reduce motion. The
player database is never opened.

Completed on 2026-09-04: **59/59** checks passed (`database:50`, `runtime:9`).
The isolated database finished with five restored active hunts and the player
database retained its exact size and SHA-256. WebView checks were automatic;
the native controls were not manually clicked during this run.

## Stage 170: Hunt Motion QA

Run `npm run dev` and open `http://127.0.0.1:1420/qa/hunt-motion.html`.
The memory-only fixture renders the production Hunt Scene and checks actor phase
boundaries, creature state precedence and all six converging position vectors.
Use the Reduce motion checkbox to verify the client preference fallback. It does
not open SQLite, resolve a hunt or modify the player save.

## Stage 168.5: Mount Artwork Tauri/SQLite QA

From the repository root, run:

```powershell
npm run tauri:dev -- --config "$PWD/qa/tauri.mount-artwork.json"
```

The dedicated page runs `runStage1685Qa` against
`stage1685_20260903.db`. It uses production migrations, repository, mapper,
Boss Trophy Hall and Collections functions, but never opens
`guild_hunt_idle.db` or mounts the production App.

Coverage includes all six local PNG responses in the Tauri WebView, ordered
Conquered/Mastered/Flawless claims, six unlocks, six mount equip/save/reload
cycles, raw JSON columns, unchanged economy/attributes and invalid persisted
mount recovery. The result page renders each mount and the shared
`CharacterSprite` composition for visual inspection.

Completed on 2026-09-03: the valid run passed **77/77** checks at 1280x800. The
first harness attempt stopped at 70 checks because its depot baseline was taken
before the repository's initial load normalization; moving the baseline after
that reload fixed the test. The native minimum-size check was interrupted by
user input and is not claimed. The player database remained 102,400 bytes with
SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`.

## Stage 168: Mount Artwork (Browser)

With `npm run dev` running, open
`http://127.0.0.1:1420/qa/collection-art.html?category=mount`. This selects the
mount variant of the memory-only fixture and never opens SQLite or mounts App.

- The seed has Flawless progress and the prior Conquered/Mastered claims, leaving
  all six mounts ready while Webkeeper Regalia remains equipped.
- 59 checks cover mapping, locked equip, ordered claim/equip, duplicate rejection,
  input immutability, unchanged power/gold, outfit/avatar preservation and JSON
  round-trip through cosmetic normalization.
- Claim and equip every mount through Trophy Hall and Collections. Profile uses
  the real shared character renderer in Details, hunt actor and right panel.
- Confirm that mount, outfit and avatar remain independent layers.
- Simulate unavailable artwork: collection previews return to text and the
  character remains visible with its outfit instead of showing a broken image.
- Inspect Gallery, Trophy Hall, Collections and Profile at 1280x720, 960x640 and
  430x900. Reset must restore the fixture's initial cosmetic state.

Completed on 2026-09-03: 59/59 mount checks, 59/59 outfit regression checks and
38/38 avatar regression checks. Browser clicks covered all six claims, mount
catalog and showcase, Sewer Stalker equipped with Webkeeper Regalia, hunt actor,
right panel, missing-art fallback and reset behavior. Screenshots were inspected
at 960x640 and 430x900; the narrow gallery uses one column. This is browser QA
only; JSON round-trip does not replace a Tauri/SQLite persistence run.

## Stage 167: Outfit Artwork (Browser)

With `npm run dev` running, open
`http://127.0.0.1:1420/qa/collection-art.html?category=outfit`.
This selects the outfit variant of the memory-only fixture. The plain URL still
runs the Stage 166 avatar checks. Neither variant opens SQLite or mounts App.

- The seed has Mastered progress and Conquered claims, leaving six outfits ready.
- 59 checks cover mapping, locked equip, claim/equip, duplicate rejection, input
  immutability, unchanged power/gold, unchanged avatar/mount and JSON round-trip
  through cosmetic normalization. JSON is not a substitute for SQLite QA.
- Claim Webkeeper from Trophy Hall, inspect Collections, and equip it. Profile
  uses the real CharacterSprite, HuntSceneActor and RightCharacterPanel.
- Claim all six outfits, then equip each one in Collections and inspect Profile.
- Equip a trophy avatar as well; its badge must not replace the outfit.
- Simulate unavailable artwork: catalog previews use sigils and CharacterSprite
  uses the original hero. Restore artwork to recover the outfit.
- Reset fixture removes outfit claims and restores the base appearance.

Completed on 2026-09-03: 59/59 outfit checks and 38/38 avatar regression checks;
six loaded RGBA assets; manual claim, locked equip, all six equipped appearances,
actor/panel rendering, avatar coexistence, text/base-hero fallback and reset.
Screenshots covered 1280x720, Hall 960x640 and Collections 430x900. Production
build and MSI/NSIS packaging passed. No new interactive Tauri/SQLite run or
installer execution was performed.

## Stage 166: Collection Artwork (Browser)

Run `npm run dev` and open `http://127.0.0.1:1420/qa/collection-art.html`.
Use the actual port printed by Vite if 1420 is already occupied. This opt-in
fixture uses production components and engine functions, but only in-memory
state. It never connects to SQLite or saves player data and is not included in
the production entrypoint.

- 38 deterministic checks cover the six mappings, invalid IDs, locked equip,
  existing claim/equip flow and unchanged inputs, attributes and gold.
- Gallery displays all six assets at 144px and in the compact avatar frame.
- Simulate unavailable artwork switches only this fixture's paths to missing
  files; all six sigils must fall back to text. Uncheck to restore the art.
- Trophy Hall starts with six Conquered rewards available. Select each wing,
  claim one, and confirm `Archived` becomes disabled.
- Collections must still hide locked previews and disable equip. After a claim,
  equip the avatar and inspect catalog, showcase, active loadout and Profile.
- Claim all six avatars exercises the same claim engine in memory. Reset fixture
  discards that test progress; it does not touch any database.
- Inspect at 1280x720, 960x640 and 430x900. The latter is web responsive QA, not a
  claim that the native Tauri window supports that width.

Completed on 2026-09-03: 38/38 checks; all six PNGs loaded; six fallback sigils
and restored art; all six wing selections; manual Arena Laurel claim; locked
Broodmother equip rejected; Arena Laurel equipped in Collections and Profile;
all six claimed avatars rendered in the catalog; reset removed those unlocks;
desktop and narrow-screen screenshots. No new interactive Tauri/SQLite run was
performed for this visual-only stage. Stage 165.5 evidence below remains from
its own run, not a new Stage 166 SQL test.

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
# Stage 171.5: Boss Motion Tauri/SQLite QA

Run the isolated native fixture with:

```powershell
npm run tauri:dev -- --config "$PWD/qa/tauri.boss-motion.json"
```

It uses only `stage1715_20260905.db`, runs the production migrations/repository, persists one five-member Ember Matriarch raid into every participant row, validates active/completed raw action JSON, restores the active raid, and writes database/WebView evidence to `stage1715_report`. The page offers Active/Completed and Reduce motion controls; hidden time-controlled probes verify telegraph and resolved states without depending on machine speed.

The player database is never opened by this runner.

Completed on 2026-09-05: **69/69** checks passed (`database:58`, `runtime:11`). The isolated database finished at 94,208 bytes, all five raw party snapshots remained active after restoration, and the player save retained its original size and SHA-256. WebView controls were covered by automated DOM/CSS probes; native controls were not manually clicked.

# Stage 171: Boss and Party Motion QA

Open `http://127.0.0.1:1420/qa/boss-motion.html` while `npm run dev` is running.

The memory-only fixture renders the production Boss Scene with five party members and verifies:

- deterministic boss guard, preparation, lunge, impact, recovery and defeated phases;
- staggered party advance, strike, recoil, recovery and guard cycles;
- telegraph-target dodge versus anchored hold-position behavior;
- victorious party precedence after the raid resolves;
- five movement vectors converging toward the boss;
- local Boss/character sprites, desktop/mobile framing and reduced-motion behavior.

Completed on 2026-09-04: **22/22** deterministic checks passed. Browser QA confirmed five simultaneous party phases, all seven arena images decoded, no horizontal overflow at desktop or 430 px, and `animation: none` plus `transform: none` for the boss and all five party members after enabling Reduce motion.
