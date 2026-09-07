/**
 * Streak and activity-history arithmetic.
 *
 * This logic previously existed twice -- once in `analyticsController.recordStudyTime`
 * and once inline in `courseController.updateLesson` -- with subtly different
 * code in each place, and both had the same two defects:
 *
 *   1. The "day" was derived from `new Date().toISOString().slice(0, 10)`, which
 *      is a UTC calendar day. For a user in IST (UTC+5:30) everything before
 *      05:30 local counted as the previous day, so a late-night session either
 *      failed to extend the streak or extended it twice on one calendar day.
 *
 *   2. Nothing tracked the *longest* streak, yet the dashboard reported
 *      `longest: studyStreak` -- so the "longest streak" card silently
 *      collapsed to the current one and dropped to 0 whenever a streak broke.
 *
 * The pure functions below take an explicit clock and timezone so they can be
 * unit-tested without a database or a fixed machine timezone.
 */

const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || "UTC";

/**
 * Calendar day in the given IANA timezone, as YYYY-MM-DD.
 * `en-CA` is used because its short date format is already ISO-ordered.
 */
function dayKey(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    // An unknown timezone string must not take down a lesson completion.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

/** The calendar day immediately before `key` (YYYY-MM-DD in, YYYY-MM-DD out). */
function previousDayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) - 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

const MAX_HISTORY_DAYS = 365;

/**
 * Pure reducer: given the streak fields as they stand and the current instant,
 * return the fields as they should be. Returns `null` when nothing changed, so
 * callers can skip the write entirely.
 *
 * @param {{studyStreak?: number, longestStreak?: number, lastActiveDate?: string, activityHistory?: string[]}} current
 * @param {{now?: Date, timeZone?: string}} [options]
 */
function advanceStreak(current, { now = new Date(), timeZone = DEFAULT_TIMEZONE } = {}) {
  const today = dayKey(now, timeZone);
  const lastActive = current.lastActiveDate || "";

  if (lastActive === today) return null;

  const previousStreak = current.studyStreak || 0;
  const studyStreak = lastActive === previousDayKey(today) ? previousStreak + 1 : 1;
  const longestStreak = Math.max(current.longestStreak || 0, studyStreak);

  const history = Array.isArray(current.activityHistory) ? [...current.activityHistory] : [];
  if (!history.includes(today)) history.push(today);

  return {
    studyStreak,
    longestStreak,
    lastActiveDate: today,
    activityHistory: history.slice(-MAX_HISTORY_DAYS),
  };
}

/**
 * Applies `advanceStreak` to a Mongoose user document in memory.
 * The caller owns `save()` -- two saves on one document raise ParallelSaveError.
 *
 * @returns {boolean} whether anything was mutated.
 */
function applyStreak(user, options) {
  if (!user) return false;
  const next = advanceStreak(
    {
      studyStreak: user.studyStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      activityHistory: user.activityHistory,
    },
    { ...options, timeZone: options?.timeZone || user.timezone || DEFAULT_TIMEZONE }
  );
  if (!next) return false;

  user.studyStreak = next.studyStreak;
  user.longestStreak = next.longestStreak;
  user.lastActiveDate = next.lastActiveDate;
  user.activityHistory = next.activityHistory;
  return true;
}

module.exports = {
  dayKey,
  previousDayKey,
  advanceStreak,
  applyStreak,
  DEFAULT_TIMEZONE,
  MAX_HISTORY_DAYS,
};
