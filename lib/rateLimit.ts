export interface RateLimitResult {
  throttled: boolean;
  remainingMs: number;
}

/**
 * Checks if a specific action exceeds the rate limit.
 * @param actionKey Unique identifier for the action (e.g. 'contact_form', 'chat_message')
 * @param limitCount Maximum allowed attempts in the window
 * @param windowMs Cooldown window in milliseconds
 */
export function isThrottled(actionKey: string, limitCount: number, windowMs: number): RateLimitResult {
  if (typeof window === 'undefined') {
    return { throttled: false, remainingMs: 0 };
  }
  const now = Date.now();
  const storageKey = `bss_rl_${actionKey}`;
  let timestamps: number[] = [];
  
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      timestamps = JSON.parse(raw);
    }
  } catch (e) {
    // Fallback if localStorage is disabled/restricted
  }

  // Filter timestamps to only keep those inside the window
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= limitCount) {
    const oldest = timestamps[0];
    const remainingMs = windowMs - (now - oldest);
    return { throttled: true, remainingMs: Math.max(0, remainingMs) };
  }

  return { throttled: false, remainingMs: 0 };
}

/**
 * Records an action timestamp for rate limiting.
 */
export function recordAction(actionKey: string, windowMs: number): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const storageKey = `bss_rl_${actionKey}`;
  let timestamps: number[] = [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      timestamps = JSON.parse(raw);
    }
  } catch (e) {
    // Ignore
  }

  timestamps = timestamps.filter(t => now - t < windowMs);
  timestamps.push(now);

  try {
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
  } catch (e) {
    // Ignore
  }
}
