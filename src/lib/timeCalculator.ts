import { toZonedTime } from "date-fns-tz";
import { differenceInMinutes, addDays, set, isWeekend } from "date-fns";

export function isValidDate(date: Date) {
  // Check if the object is actually a Date instance
  if (Object.prototype.toString.call(date) === "[object Date]") {
    // Check if the time value is NaN (indicating an invalid date)
    return !isNaN(date.getTime());
  }
  // If it's not a Date object, it's not a valid date
  return false;
}

// e.g. "2025-11-27 14:00"
export function localToUTCISOString(localDateTime: string) {
  // Replace the space with a 'T' to create a valid ISO 8601 string.
  // JavaScript's Date constructor will interpret this string in the local time zone.
  const dateWithT = localDateTime.replace(" ", "T");

  const localDate = new Date(dateWithT);

  // Check if the date is valid before attempting to convert.
  if (!isValidDate(localDate)) {
    return null;
  }

  // toISOString() automatically converts the local Date object to a UTC ISO string.
  return localDate.toISOString();
}

export function calculateOvertimePlannedHours(
  startIso: string,
  endIso: string,
) {
  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  // Get difference in minutes first for better precision
  const minutes = differenceInMinutes(endDate, startDate);

  // Convert to hours
  return minutes / 60;
}

/**
 * Calculates planned hours respecting the Employee's Timezone.
 * @param startIso - UTC ISO string from DB
 * @param endIso - UTC ISO string from DB
 * @param timeZone - IANA string (e.g., 'America/New_York', 'Asia/Tokyo')
 */
export function calculateLeaveHours(
  startIso: string,
  endIso: string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  // 1. Convert UTC timestamps to the Employee's "Wall Clock" time
  let current = toZonedTime(startIso, timeZone);
  const endZoned = toZonedTime(endIso, timeZone);

  const WORK_START = 9; // 09:00
  const WORK_END = 18; // 18:00
  let totalMinutes = 0;

  // Loop through days until we pass the end date
  while (current < endZoned) {
    // 2. Skip Weekends (using the zoned time)
    if (isWeekend(current)) {
      current = addDays(current, 1);
      // Reset to start of day for the next loop
      current = set(current, { hours: 0, minutes: 0, seconds: 0 });
      continue;
    }

    // 3. Define Work Start/End for THIS specific day in THIS timezone
    const workStartToday = set(current, { hours: WORK_START, minutes: 0 });
    const workEndToday = set(current, { hours: WORK_END, minutes: 0 });

    // 4. Clamping Logic (Intersection of "Requested Time" and "Work Hours")
    // Start: Max(RequestedStart, WorkStart)
    const actualStart = current > workStartToday ? current : workStartToday;

    // End: Min(RequestedEnd, WorkEnd)
    // Note: We need to compare against endZoned or workEndToday
    let actualEnd = workEndToday;

    // If the request ends on this same day and is before 6pm, use that
    if (endZoned < workEndToday && endZoned.getDate() === current.getDate()) {
      actualEnd = endZoned;
    }

    // 5. Calculate Minutes
    if (actualEnd > actualStart) {
      let minutes = differenceInMinutes(actualEnd, actualStart);

      // Deduct Lunch: If worked > 5 hours (300 mins), minus 60 mins
      if (minutes > 300) {
        minutes -= 60;
      }
      totalMinutes += minutes;
    }

    // Move to next day, reset to 00:00
    current = addDays(current, 1);
    current = set(current, { hours: 0, minutes: 0 });
  }

  return totalMinutes / 60;
}
