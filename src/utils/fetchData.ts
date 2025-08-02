import {
  jsonToGraphQLQuery as genQuery,
  EnumType
} from 'json-to-graphql-query';
import memoizeOne from 'memoize-one';

/**
 * Defines details for a single location's regression request.
 */
interface RequestDetail {
  location: string;
  metrics: string[];
  averageYears: number;
  startYear: number;
  endYear: number;
  regressionDegree: number;
}

/**
 * Specifies request parameters involving multiple locations.
 */
interface RequestsDetail {
  locations: string[];
  metrics: string[];
  averageYears: number;
  startYear: number;
  endYear: number;
  regressionDegree: number;
}

/**
 * Represents a single historical data point for a metric.
 */
export interface HistoricalMetricData {
  metric: string;
  value: number;
  date: string;
}

/**
 * Contains results of statistical tests from regression analysis.
 */
export interface TestResults {
  pValue: number;
  significant: boolean;
  fStatistic: number;
}

/**
 * Holds regression analysis results for a metric.
 */
export interface RegressionResult {
  coefficients: number[];
  rSquared: number;
  testResults: TestResults;
  baseDate: string;
}

/**
 * Maps a metric to its regression results.
 */
export interface MetricRegression {
  metric: string;
  results: RegressionResult;
}

/**
 * API response structure for weather analysis queries.
 */
export interface APIResponse {
  historicalData: HistoricalMetricData[];
  regression: MetricRegression[];
  locationName: string;
}

/**
 * Represents organized metric data for a location.
 */
export interface MetricData {
  metric: string;
  days: HistoricalMetricData[];
  regression: MetricRegression;
}

/**
 * Final organized data structure for rendering or analysis.
 */
export interface Data {
  location: string;
  weather: MetricData[];
}

/**
 * Organizes raw API response data by location and metric.
 * Uses memoization to avoid recomputation on unchanged inputs.
 *
 * @param data - Array of raw API responses
 * @returns Organized data array
 */
export const organizeData = memoizeOne((data: APIResponse[]): Data[] => {
  const locations = data.map((data) => data.locationName);
  const metrics = [...new Set(data[0].historicalData.map((day) => day.metric))];
  return locations.map((location, index) => ({
    location,
    weather: metrics.map((metric) => ({
      metric,
      days: data[index].historicalData.filter((day) => day.metric === metric),
      regression: data[index].regression.find(
        (regression) => regression.metric === metric
      )!
    }))
  }));
});

/**
 * Fetches weather and regression data for a single location.
 *
 * @param eventDetail - Parameters for data request
 * @returns Parsed API response for a location
 */
export const fetchOneLocation = async (eventDetail: RequestDetail) => {
  const {
    location,
    metrics,
    averageYears,
    startYear,
    endYear,
    regressionDegree
  } = eventDetail;
  const queryObj = {
    query: {
      weatherAnalysis: {
        __args: {
          input: {
            location,
            startYear,
            endYear,
            averageYears,
            regressionDegree,
            metrics: metrics.map((m) => new EnumType(m))
          }
        },
        historicalData: {
          date: true,
          metric: true,
          value: true
        },
        regression: {
          metric: true,
          results: {
            coefficients: true,
            rSquared: true,
            baseDate: true,
            testResults: {
              fStatistic: true,
              pValue: true,
              significant: true
            }
          }
        },
        locationName: true
      }
    }
  };
  const query = genQuery(queryObj);
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  if (!resp.ok) {
    console.log(await resp.json());
    throw new Error('Failed to fetch weather data.');
  }
  const json = await resp.json();
  return json.data.weatherAnalysis as APIResponse;
};

/**
 * Fetches and organizes weather data for multiple locations.
 *
 * @param eventDetail - Parameters including multiple locations
 * @returns Structured data across locations and metrics
 */
export const fetchData = async (eventDetail: RequestsDetail) => {
  const promises = eventDetail.locations.map(
    async (location) => await fetchOneLocation({ ...eventDetail, location })
  );
  const results = await Promise.all(promises);
  return organizeData(results);
};
