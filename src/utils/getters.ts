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

export const getUnit = (metric: string) => {
  if (metric.includes('TEMPERATURE')) return '°F';
  else if (metric.includes('PRECIPITATION') || metric.includes('SNOWFALL'))
    return 'in';
  else return 'mph';
};

export const getMetricName =
  (thisAverageYears: () => number) => (metric: string, location: string) =>
    `${metric
      .replaceAll('_', ' ')
      .toLocaleLowerCase()} in ${location} (${thisAverageYears()}-year moving average)`;
