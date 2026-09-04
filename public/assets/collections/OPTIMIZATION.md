# Collection Artwork Delivery Pipeline

Stage 169. The 18 generated Collection images keep their original filenames,
IDs, PNG format and visual role, but now use delivery-sized dimensions suited
to their largest current UI presentation. The source generation prompts remain
documented in `README.md`, `OUTFITS.md` and `MOUNTS.md`.

Run the deterministic Windows pipeline from the project root:

```powershell
.\scripts\optimize-collection-artwork.ps1
.\scripts\optimize-collection-artwork.ps1 -Apply
```

The first command is a dry run. `-Apply` writes each candidate to a temporary
directory, decodes it, checks its dimensions and alpha corner where required,
rejects suspicious output, and only then replaces the project copy.

## Delivery Sizes

- Avatars: 384x384, preserving their intentional opaque charcoal background.
- Outfits: 512x512 RGBA, preserving transparent corners.
- Mounts: maximum edge 640px with original aspect ratio and transparent corners.

The full set changed from 31,627,090 bytes (30.16 MiB) to 5,927,062 bytes
(5.65 MiB), an 81.3% reduction. Category totals are 1,560,706 bytes for
avatars, 1,411,875 bytes for outfits and 2,954,481 bytes for mounts.

Runtime IDs and file paths did not change, so existing SQLite saves require no
migration. Sprite URLs carry `?v=169` to invalidate older WebView caches.
Collection catalog thumbnails use native lazy loading; the selected showcase,
Store showcase and equipped avatar request eager high-priority loading.
