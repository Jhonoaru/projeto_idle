# Persistence Plan

Guild Hunt Idle will use local persistence only. When the gameplay loop is ready,
add SQLite + Prisma with a schema focused on guild state, adventurers, contracts,
inventory, and offline progress snapshots.

Keep database access isolated from React components so the UI can stay easy to
test and the storage layer can evolve without reshaping the screens.
