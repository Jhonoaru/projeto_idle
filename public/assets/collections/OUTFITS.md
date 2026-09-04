# Boss Trophy Outfit Artwork

Stage 167. Generated on 2026-09-03 using the built-in OpenAI image generation tool.
Six separate text-to-image requests, no external reference images or franchise assets.
The original PNG outputs were initially copied unchanged into `generated/`.
Stage 169 resized the runtime copies to 512x512 RGBA using the deterministic
pipeline in `OPTIMIZATION.md`; transparent corner pixels remain preserved.

The shared sprite renderer resolves the equipped `activeOutfitId`. These are
static full-body costumes, one figure per outfit, not layered clothing fitted
to each hero. They do not depict the currently equipped weapon, animate attacks,
change vocation or grant attributes. Base hero art remains the fallback when
an outfit has no asset or fails to load. A failed base sprite uses initials.
Avatar emblems and mount selections remain separate. Runtime uses local files
only. Unlock IDs, claim rules and SQLite data are unchanged.

## Prompts

### outfit-webkeeper.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Webkeeper Regalia. One full-body adventurer wearing layered charcoal sewer leathers, muted jade sash, silver web-shaped shoulder clasp, hood and face-covering scarf, reinforced leather boots and gloves. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.

### outfit-warcamp-raider.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Warcamp Raider. One full-body adventurer wearing a hardened dark leather field coat with battered iron shoulder armor, deep crimson sash and torn short cloak, enclosed iron helmet with face guard, sturdy boots and gloves. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.

### outfit-crypt-sentinel.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Crypt Sentinel. One full-body adventurer wearing ceremonial dark silver plate, pale bone-colored engraved edging, muted violet cloth tabard, angular closed guardian helmet, plated gloves and boots. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.

### outfit-gatekeeper-plate.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Gatekeeper Plate. One full-body adventurer wearing heavy iron and aged bronze fortress armor, broad squared pauldrons, teal cloth underlayer, portcullis-inspired geometric chest engraving, enclosed angular helmet, plated boots and gloves. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.

### outfit-ashen-warden.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Ashen Warden. One full-body adventurer wearing heat-scarred obsidian armor with copper edges, burnt crimson regalia and short split cloak, small ember accents on chest and shoulders, enclosed dark helmet, heavy boots and gloves. No floating fire effects. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.

### outfit-arena-champion.png

Use case: stylized-concept. Original fantasy idle RPG outfit sprite: Arena Champion. One full-body adventurer wearing polished steel arena harness with gold laurel shoulder details, emerald cloth tabard, short ivory cape, enclosed tournament helmet, armored boots and gloves. Detailed hand-painted pixel-art RPG character, strong readable silhouette, three-quarter front view facing slightly left, neutral standing combat-ready pose, arms slightly apart and empty hands, no weapon. Entire head and feet inside frame, character fills 80 percent of square canvas, centered, no ground plane or scenery. Genuinely transparent background with alpha, no checkerboard painted into image, no shadow rectangle. No text, UI, labels, watermark or franchise symbols.
