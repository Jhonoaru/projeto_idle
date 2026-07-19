export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes > 0) {
    return `${minutes}min ${seconds}s`;
  }

  return `${seconds}s`;
}

export function formatDurationFromSeconds(seconds: number) {
  return formatDuration(seconds * 1000);
}

export function formatDurationFromMinutes(minutes: number) {
  return formatDuration(minutes * 60_000);
}

export function getClockElapsedMs(startedAt: string) {
  const now = new Date();
  const started = parseActionTimestamp(startedAt, now);

  if (!started) return 0;

  if (!startedAt.includes("T") && started.getTime() > now.getTime() + 12 * 60 * 60 * 1000) {
    started.setDate(started.getDate() - 1);
  }

  return Math.max(0, now.getTime() - started.getTime());
}

export function getClockRemainingMs(endsAt: string) {
  const now = new Date();
  const ends = parseActionTimestamp(endsAt, now);

  if (!ends) return 0;

  if (!endsAt.includes("T") && ends.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
    ends.setDate(ends.getDate() + 1);
  }

  return Math.max(0, ends.getTime() - now.getTime());
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function parseActionTimestamp(value: string, anchor: Date) {
  if (value.includes("T")) {
    const timestamp = new Date(value);
    return Number.isFinite(timestamp.getTime()) ? timestamp : undefined;
  }

  const parts = value.split(":").map(Number);
  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part))) return undefined;

  const [hours, minutes, seconds = 0] = parts;
  const date = new Date(anchor);
  date.setHours(hours, minutes, seconds, 0);

  return date;
}
