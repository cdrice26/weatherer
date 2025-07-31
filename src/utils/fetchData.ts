import {
  jsonToGraphQLQuery as genQuery,
  EnumType
} from 'json-to-graphql-query';

interface RequestDetail {
  location: string;
  metrics: string[];
  averageYears: number;
  startYear: number;
  endYear: number;
  regressionDegree: number;
}

export interface HistoricalMetricData {
  metric: string;
  value: number;
  year: number;
}

export interface TestResults {
  pValue: number;
  significant: boolean;
  fStatistic: number;
}
export interface RegressionResult {
  coefficients: number[];
  rSquared: number;
  testResults: TestResults;
}

export interface MetricRegression {
  metric: string;
  results: RegressionResult;
}

export interface APIResponse {
  historicalData: HistoricalMetricData[];
  regression: MetricRegression[];
  locationName: string;
}

export const fetchData = async (eventDetail: RequestDetail) => {
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
          year: true,
          metric: true,
          value: true
        },
        regression: {
          metric: true,
          results: {
            coefficients: true,
            rSquared: true,
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
    throw new Error('Failed to fetch weather data.');
  }
  const json = await resp.json();
  return json.data.weatherAnalysis as APIResponse;
};
