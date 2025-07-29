import { jsonToGraphQLQuery as genQuery } from 'json-to-graphql-query';

export interface RequestDetail {
  location: string;
  metrics: string[];
  averageYears: number;
  startYear: number;
  endYear: number;
  regressionDegree: number;
}

export interface TestRequest {
  pValue: boolean;
  significant: boolean;
  fStatistic: boolean;
}
export interface RegressionRequest {
  coefficients: boolean;
  rSquared: boolean;
  testResults: TestRequest;
}

export interface HistoricalData {
  year: number;
  averageTemperature?: number;
  averageApparentTemperature?: number;
  precipitation?: number;
  snowfall?: number;
  maxWindSpeed?: number;
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

export interface RegressionResults {
  averageTemperature?: RegressionResult;
  averageApparentTemperature?: RegressionResult;
  precipitation?: RegressionResult;
  snowfall?: RegressionResult;
  maxWindSpeed?: RegressionResult;
}

export interface APIResponse {
  historicalData: HistoricalData;
  regression: RegressionResults;
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
            regressionDegree
          }
        },
        historicalData: {
          year: true,
          ...metrics.reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {} as { [key: string]: boolean })
        },
        regression: metrics.reduce((acc, key) => {
          acc[key] = {
            coefficients: true,
            rSquared: true,
            testResults: {
              pValue: true,
              significant: true,
              fStatistic: true
            }
          };
          return acc;
        }, {} as { [key: string]: RegressionRequest }),
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
  console.log(json);
  return json.data.weatherAnalysis as APIResponse;
};
