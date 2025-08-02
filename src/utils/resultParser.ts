/**
 * Converts a polynomial degree to its corresponding descriptive label.
 *
 * @param degree - The degree of the polynomial (e.g. 1, 2, 3, ...)
 * @returns A string describing the polynomial type:
 *          'linear' for degree 1, 'quadratic' for 2, 'cubic' for 3, etc.
 *          Returns generic text for degrees beyond 5.
 */
export const getDegreeText = (degree: number) => {
  switch (degree) {
    case 1:
      return 'linear';
    case 2:
      return 'quadratic';
    case 3:
      return 'cubic';
    case 4:
      return 'quartic';
    case 5:
      return 'quintic';
    default:
      return `${degree}-th degree polynomial`;
  }
};

/**
 * Rounds a number to the nearest thousandth (three decimal places).
 *
 * @param num - The number to be rounded
 * @returns A number rounded to three decimal places
 */
export const toNearestThousandth = (num: number) =>
  Math.round(num * 1000) / 1000;
