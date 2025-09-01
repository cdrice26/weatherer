/**
 * Creates a metric filter function based on a selected metric category.
 *
 * @param thisMetric - A function that returns the current metric type ('temp', 'precip', or 'wind')
 * @returns A function that accepts a metric name and returns true if it matches the selected category
 */
export const getMetricFilter =
  (thisMetric: () => string) => (metric: string) => {
    if (thisMetric() === 'temp') {
      return metric.includes('TEMP');
    }
    if (thisMetric() === 'precip') {
      return metric.includes('PRECIP') || metric.includes('SNOW');
    }
    if (thisMetric() === 'wind') {
      return metric.includes('WIND');
    }
  };

/**
 * Returns the unit of measurement for a given metric name.
 *
 * @param metric - The name of the metric (e.g. 'TEMPERATURE_MAX', 'SNOWFALL_TOTAL')
 * @returns Unit string: '°F' for temperature, 'in' for precipitation/snowfall, 'mph' for others
 */
export const getUnit = (metric: string) => {
  if (metric.includes('TEMPERATURE')) return '°F';
  else if (metric.includes('PRECIPITATION') || metric.includes('SNOWFALL'))
    return 'in';
  else return 'mph';
};

/**
 * Generates a function that generates a human-readable name for a metric with location
 * and moving average info.
 *
 * @param thisAverageYears - A function returning the number of years to average over
 * @returns A function that builds a label for a specific metric and location
 *
 * @example
 * getMetricName(() => 5)('TEMPERATURE_MAX', 'Boston')
 * // returns: "daily temperature max in Boston (5-year moving average) (°F)"
 */
export const getMetricName =
  (thisAverageYears: () => number) => (metric: string, location: string) =>
    `daily ${metric
      .replaceAll('_', ' ')
      .toLocaleLowerCase()} in ${location} (${thisAverageYears()}-year average) (${getUnit(
      metric
    )})`;
