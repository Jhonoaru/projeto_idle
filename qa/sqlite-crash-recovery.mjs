import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

// Isolated SQLite durability probe; does not open the game's database or Tauri.
if (process.argv[2] === '--writer') {
  const db = new DatabaseSync(process.argv[3]);
  db.exec("BEGIN IMMEDIATE; DELETE FROM guilds; INSERT INTO guilds VALUES ('guild', 999)");
  process.send('uncommitted');
  setInterval(() => {}, 1000);
} else {
  const directory = mkdtempSync(join(tmpdir(), 'guild-hunt-crash-'));
  let child;
  let db;
  try {
    const path = join(directory, 'audit.db');
    db = new DatabaseSync(path);
    db.exec("CREATE TABLE guilds (id TEXT PRIMARY KEY, gold INTEGER); INSERT INTO guilds VALUES ('guild', 123)");
    db.close();
    db = undefined;
    child = fork(fileURLToPath(import.meta.url), ['--writer', path], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
    const exit = once(child, 'exit');
    const [message] = await once(child, 'message', { signal: AbortSignal.timeout(15000) });
    assert.equal(message, 'uncommitted');
    child.kill('SIGKILL');
    await exit;
    db = new DatabaseSync(path);
    assert.equal(db.prepare('SELECT gold FROM guilds').get().gold, 123);
    assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    db.exec("BEGIN IMMEDIATE; UPDATE guilds SET gold = 456; COMMIT");
    db.close();
    db = new DatabaseSync(path);
    assert.equal(db.prepare('SELECT gold FROM guilds').get().gold, 456);
    console.log('PASS: process killed after uncommitted deletes/inserts; old state intact, integrity OK, subsequent commit survives reopen');
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exit = once(child, 'exit');
      child.kill('SIGKILL');
      await exit;
    }
    db?.close();
    rmSync(directory, { recursive: true, force: true });
  }
}
