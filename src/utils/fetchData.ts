import { jsonToGraphQLQuery as genQuery } from 'json-to-graphql-query';

export interface RequestDetail {
  location: string;
  metrics: string[];
  averageYears: number;
  startYear: number;
  endYear: number;
  regressionDegree: number;
}

export interface TestResults {
  pValue: boolean;
  significant: boolean;
  fStatistic: boolean;
}
export interface RegressionResults {
  coefficients: boolean;
  rSquared: boolean;
  testResults: TestResults;
}

export interface HistoricalData {
  year: number;
  averageTemperature?: number;
  averageApparentTemperature?: number;
  precipitation?: number;
  snowfall?: number;
  maxWindSpeed?: number;
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
        }, {} as { [key: string]: RegressionResults }),
        locationName: true
      }
    }
  };
  const query = genQuery(queryObj);
  console.log(query);
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
  return json.data as APIResponse;
};
