
import { DateTime } from "luxon";

/**
 * DateHelper
 *
 * @todo: In near future we will move this code to common library
 */
class DateHelper {
  /**
   * Formats an ISO date string to a readable format "DayMonthYear".
   *
   * Converts the given date from ISO string format to a human-readable format
   * with the day, full month name, and year. The function also appends the
   * appropriate ordinal suffix to the day.
   *
   * @param {string} dateISO - The date string in ISO format to be formatted.
   * @returns {string} The formatted date string in "DayMonthYear" format with ordinal suffix.
   */
  formatDateToDayMonthYear(dateISO: string): string {
    const date: DateTime<true> | DateTime<false> = DateTime.fromISO(dateISO);
    const day: number = date.day;
    const month: string = date.toFormat("LLLL"); // Full month name
    const year: number = date.year;

    /**
     * Returns the ordinal suffix for a given number.
     * The function handles numbers greater than 3 and less than 21 with a "th" suffix.
     * For other numbers, it calculates the suffix based on the last digit.
     *
     * @param {number} n - The number to determine the ordinal suffix for.
     * @returns {string} The ordinal suffix ("st", "nd", "rd", or "th") for the given number.
     */
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month} ${year}.`;
  }

  /**
   * getPastISODate
   *
   * Gets the ISO date string for a given number of days ago.
   *
   * @param {number} daysAgo - The number of days ago to get the ISO date string for.
   * @returns {string} The ISO date string for the given days ago, @example: "2025-04-12T02:59:22.932+00:00".
   */
  getPastISODate(daysAgo: number): string {
    return DateTime.now().minus({ days: daysAgo }).toISO();
  }

  /**
   * getCurrentDayMonthYearFormattedDate
   *
   * Gets the current date formatted as "dd-MM-yyyy".
   *
   * This function fetches the current date and formats it into a string
   * representation using the "day-month-year" format, where the day and
   * month are zero-padded to two digits.
   *
   * @returns {string} The current date formatted as "dd-MM-yyyy".
   */
  getCurrentDayMonthYearFormattedDate(): string {
    return DateTime.now().toFormat("dd-MM-yyyy");
  }

  /**
   * getISODate
   *
   * Gets the current date and time as an ISO 8601 string in the format
   * "YYYY-MM-DDTHH:mm:ss.sssZ".
   *
   * @returns {string} The current date and time as an ISO 8601 string.
   */
  getISODate(): string {
    return DateTime.now().toISO();
  }

  /**
   * getISODateFromTimestamp
   *
   * Converts a given timestamp to an ISO 8601 date string.
   *
   * This function takes a timestamp in milliseconds and converts it into an ISO 8601 date string.
   * If the conversion is unsuccessful, it returns an empty string.
   *
   * @param {number} timestamp - The timestamp in milliseconds to be converted.
   * @returns {string} The ISO 8601 formatted date string or an empty string if conversion fails.
   */
  getISODateFromTimestamp(timestamp: number): string {
    const isoDate: string | null = DateTime.fromMillis(timestamp).toISO(); // "2025-04-25T10:33:59.783Z"
    if (!isoDate) {
      return "";
    }

    return isoDate;
  }

  /**
   * getFutureDateWithTimezone
   *
   * Creates a future date by adding specified days to current date and converting to specified timezone.
   *
   * @param {number} days - Number of days to add to current date
   * @param {string} timezone - Timezone to set (e.g., "GMT", "Asia/Calcutta")
   * @returns {Date} JavaScript Date object representing the future date
   *
   * @example
   * // Sample output for getFutureDateWithTimezone(15, "GMT"):
   * // If current date is 2024-01-15T10:30:00.000Z
   * // Returns: Mon Jan 30 2024 10:30:00 GMT+0000 (Greenwich Mean Time)
   */
  getFutureDateWithTimezone(days: number, timezone: string): Date {
    return DateTime.now().plus({ days }).setZone(timezone).toJSDate();
  }

  /**
   * getFutureTimestampWithTimezone
   *
   * Creates a future timestamp by adding specified days to current date and converting to specified timezone.
   *
   * @param {number} days - Number of days to add to current date
   * @param {string} timezone - Timezone to set (e.g., "GMT", "Asia/Calcutta")
   * @returns {number} Timestamp in milliseconds representing the future date
   *
   * @example
   * // Sample output for getFutureTimestampWithTimezone(15, "GMT"):
   * // If current date is 2024-01-15T10:30:00.000Z
   * // Returns: 1706178600000
   */
  getFutureTimestampWithTimezone(days: number, timezone: string): number {
    return DateTime.now().plus({ days }).setZone(timezone).toMillis();
  }

  /**
   * formatISODateToDDMMYYYY
   * 
   * Formats an ISO date string to dd-MM-YYYY format.
   *
   * @param {string} isoDate - The ISO date string to format.
   * @returns {string} The formatted date string in dd-MM-YYYY format.
   */
  formatISODateToDDMMYYYY(isoDate: string): string {
    return DateTime.fromISO(isoDate).toFormat("dd-MM-yyyy");
  }
}

const dateHelperObj = new DateHelper();
export { dateHelperObj, DateHelper };
