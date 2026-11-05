import { format, formatDistanceToNow, isToday, isYesterday, isSameDay } from "date-fns";

/**
 * Safely parse any timestamp value into a valid JS Date object.
 * Handles:
 * - SQLite datetime format: "2026-11-05 13:41:00" -> treated as UTC ("2026-11-05T13:41:00Z")
 * - Standard ISO-8601: "2026-11-05T13:41:00.000Z"
 * - Epoch seconds (10 digits): 1793885400
 * - Epoch milliseconds (13 digits): 1793885400000
 * - Date instances
 */
export const parseSafeDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  let str = String(val).trim();
  if (!str) return null;

  // Epoch in seconds (10 digits)
  if (/^\d{10}$/.test(str)) {
    return new Date(Number(str) * 1000);
  }
  // Epoch in milliseconds (13 digits)
  if (/^\d{13}$/.test(str)) {
    return new Date(Number(str));
  }

  // If SQLite format "YYYY-MM-DD HH:MM:SS" (without timezone suffix), treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(str) && !str.endsWith("Z")) {
    str = str.replace(" ", "T") + "Z";
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format message bubble timestamp in local time (e.g. 19:10)
 */
export const formatMessageTime = (val) => {
  const d = parseSafeDate(val);
  if (!d) return "";
  try {
    return format(d, "HH:mm");
  } catch {
    return "";
  }
};

/**
 * Format sidebar contact list time:
 * - Today: shows message time (e.g., "19:10") or relative if within recent minutes
 * - Yesterday: shows "Yesterday"
 * - Older: shows date (e.g. "04/11/2026")
 */
export const formatContactTime = (val) => {
  const d = parseSafeDate(val);
  if (!d) return "";
  try {
    if (isToday(d)) {
      return format(d, "HH:mm");
    }
    if (isYesterday(d)) {
      return "Yesterday";
    }
    return format(d, "dd/MM/yyyy");
  } catch {
    return "";
  }
};

export { isToday, isYesterday, isSameDay };
