/**
 * Generate a date from an ISO string, ignoring the time
 * @param isoString - The ISO string to generate the date from
 * @returns The date without the time
 */
export const asDate = (isoString: string) => {
  const utcDate = new Date(isoString);

  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();

  const localDate = new Date(year, month, day);

  return localDate;
};
