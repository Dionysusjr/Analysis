const JSE_TIMEZONE = "America/Jamaica";

/** JSE Main Market normally trades 9:30am-3:30pm, Monday-Friday, Jamaica time. */
export function isJseMarketOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JSE_TIMEZONE,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  if (weekday === "Sat" || weekday === "Sun") return false;

  const minutesNow = hour * 60 + minute;
  const open = 9 * 60 + 30;
  const close = 15 * 60 + 30;
  return minutesNow >= open && minutesNow < close;
}

export function jseTradeDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: JSE_TIMEZONE }).format(now);
}
