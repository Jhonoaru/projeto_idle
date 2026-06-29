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
  const started = parseClockToday(startedAt);
  const now = new Date();

  if (started.getTime() > now.getTime() + 12 * 60 * 60 * 1000) {
    started.setDate(started.getDate() - 1);
  }

  return Math.max(0, now.getTime() - started.getTime());
}

export function getClockRemainingMs(endsAt: string) {
  const ends = parseClockToday(endsAt);
  const now = new Date();

  if (ends.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
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

function parseClockToday(clock: string) {
  const [hours = 0, minutes = 0, seconds = 0] = clock.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);

  return date;
}
