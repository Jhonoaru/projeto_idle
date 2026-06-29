# Guild Hunt Idle

Desktop offline idle guild manager inspired by classic MMORPGs.

## Stack

- Tauri v2
- React
- TypeScript
- Vite

## Local development

Install dependencies:

```powershell
npm.cmd install
```

Run the desktop app in development mode:

```powershell
npm.cmd run tauri:dev
```

Run only the Vite web frontend:

```powershell
npm.cmd run dev
```

Build the frontend:

```powershell
npm.cmd run build
```

Build the desktop app:

```powershell
npm.cmd run tauri:build
```

## Future persistence

The project is prepared to add local SQLite + Prisma later. The intended path is:

- Add Prisma dependencies.
- Create `prisma/schema.prisma`.
- Use SQLite as the local datasource.
- Keep game state persistence behind a small repository/service layer.
