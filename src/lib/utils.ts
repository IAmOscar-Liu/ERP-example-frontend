import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { localToUTCISOString } from "./timeCalculator";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function waitFor(timeout: number) {
  return await new Promise<void>((res) => setTimeout(res, timeout));
}

export function isDev() {
  return import.meta.env.MODE === "development";
}

export function extractErrorMessage(error: any) {
  if (isAxiosError(error)) {
    return error.response?.data?.message
      ? String(error.response.data.message)
      : error.message;
  }
  return error.message ? String(error.message) : JSON.stringify(error, null, 2);
}

export function formatHourDuration(totalHours: number): string {
  if (totalHours < 0) {
    return "0 minutes";
  }

  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  const pad = (n: any) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Convert a JS Date to "YYYY-MM-DD" in a specific timezone.
 *
 * @param date JS Date object
 * @param timeZone e.g. "Asia/Taipei", "America/New_York"
 */
export function toDateOnlyString(
  date: Date,
  option: { timeZone?: string } = {},
): string {
  const timeZone =
    option.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Use Intl API to convert the date to the target timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // en-CA outputs YYYY-MM-DD format by default
  // but it may contain slashes depending on environment, so normalize:
  const parts = formatter.formatToParts(date);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  return `${year}-${month}-${day}`;
}

export function toTimeOnlyString(
  date: Date,
  option: { timeZone?: string; withSecond?: boolean } = { withSecond: true },
): string {
  const timeZone =
    option.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")!.value;
  const minute = parts.find((p) => p.type === "minute")!.value;
  const second = parts.find((p) => p.type === "second")!.value;

  return option.withSecond
    ? `${hour}:${minute}:${second}`
    : `${hour}:${minute}`;
}

export function toDateTimeString(
  date: Date,
  option: { timeZone?: string; withSecond?: boolean } = { withSecond: true },
): string {
  const timeZone =
    option.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const datePart = toDateOnlyString(date, { timeZone });

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")!.value;
  const minute = parts.find((p) => p.type === "minute")!.value;
  const second = parts.find((p) => p.type === "second")!.value;

  return option.withSecond
    ? `${datePart} ${hour}:${minute}:${second}`
    : `${datePart} ${hour}:${minute}`;
}

export function minuteToHourMinute(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${h}h ${m}m`;
}

export function dateStringToDate(localDate: string) {
  const utcIsoString = localToUTCISOString(localDate + " 00:00");
  if (!utcIsoString) return null;
  return new Date(utcIsoString);
}

/**
 * Gets the first and last day of a specified month and year, formatted as 'yyyy-mm-dd'.
 * * @param {number} month The month number (1 = Jan, 12 = Dec).
 * @param {number} year The year (e.g., 2025).
 * @returns {{firstDay: string, lastDay: string}} An object with the formatted date strings.
 */
export function getFormattedMonthBoundaries(month: number, year: number) {
  // Helper function to format a Date object into 'yyyy-mm-dd'
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    // Month is 0-indexed, so we add 1 and pad with a leading zero if needed
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    // Day of the month, padded with a leading zero if needed
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  // 1. Calculate the First Day
  // Month is (month - 1) because Date constructor is 0-indexed for month
  const firstDayDate = new Date(year, month - 1, 1);

  // 2. Calculate the Last Day
  // Setting the day to 0 of the NEXT month rolls back to the last day of the current month
  const lastDayDate = new Date(year, month, 0);

  return {
    firstDay: formatDate(firstDayDate),
    lastDay: formatDate(lastDayDate),
  };
}

/**
 * Calculates and returns the first and last day of the current and previous month,
 * formatted as 'yyyy-mm-dd'.
 * * @returns {{
 * currentMonth: { firstDay: string, lastDay: string },
 * lastMonth: { firstDay: string, lastDay: string }
 * }}
 */
export function getCurrentAndLastMonthBoundaries() {
  // --- Helper Function for Formatting ---
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    // Month is 0-indexed, so we add 1 and pad
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    // Day of the month, padded
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  // --- Core Logic ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 10=Nov)

  // 1. Current Month Boundaries
  // First day: new Date(year, monthIndex, 1)
  const currentMonthFirstDate = new Date(currentYear, currentMonth, 1);
  // Last day: new Date(year, monthIndex + 1, 0)
  const currentMonthLastDate = new Date(currentYear, currentMonth + 1, 0);

  // 2. Previous Month Boundaries
  // The previous month index is simply 'currentMonth - 1'
  const lastMonthIndex = currentMonth - 1;

  // First day of last month: new Date(year, monthIndex - 1, 1)
  const lastMonthFirstDate = new Date(currentYear, lastMonthIndex, 1);
  // Last day of last month: new Date(year, monthIndex, 0)
  const lastMonthLastDate = new Date(currentYear, currentMonth, 0);

  // --- Return Formatted Results ---
  return {
    currentMonth: {
      firstDay: formatDate(currentMonthFirstDate),
      lastDay: formatDate(currentMonthLastDate),
    },
    lastMonth: {
      firstDay: formatDate(lastMonthFirstDate),
      lastDay: formatDate(lastMonthLastDate),
    },
  };
}
