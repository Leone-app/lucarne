let scheduleTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleFeature(timeStr: string, onFire: () => void): void {
  if (scheduleTimer) clearTimeout(scheduleTimer);
  if (!timeStr) return;

  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();
  const inMinutes = Math.round(delay / 60000);
  console.log(`[Scheduler] Feature scheduled in ${inMinutes} min (${timeStr})`);

  scheduleTimer = setTimeout(() => {
    console.log('[Scheduler] Launching feature film');
    onFire();
  }, delay);
}

export function cancelSchedule(): void {
  if (scheduleTimer) {
    clearTimeout(scheduleTimer);
    scheduleTimer = null;
    console.log('[Scheduler] Cancelled');
  }
}
