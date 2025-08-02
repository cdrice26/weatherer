import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData';
import {
  getMetricFilter,
  getMetricName as getMetricNameExt,
  getUnit
} from './utils/getters';
import { getDegreeText, toNearestThousandth } from './utils/resultParser';

/**
 * A web component that renders a summary of regression results
 * for weather metrics across multiple locations.
 *
 * @element regression-results
 *
 * @property {Data[]} data - Structured weather and regression data for display
 * @property {number} averageYears - Number of years used for moving average calculations
 * @property {string} metric - Metric category being analyzed ('temp', 'precip', or 'wind')
 *
 * Displays:
 * - A paragraph for each metric/location combination, describing:
 *   - Trend direction (increasing or decreasing)
 *   - Rate of change (if linear)
 *   - Statistical significance (based on P-value)
 *   - R-squared explanation power
 *   - Degree of polynomial relationship
 */
@customElement('regression-results')
export class RegressionResults extends LitElement {
  /**
   * Main dataset with weather and regression data.
   */
  @property({ type: Array })
  data!: Data[];

  /**
   * Number of years to average for trend calculations.
   */
  @property({ type: Number })
  averageYears!: number;

  /**
   * Selected weather metric type ('temp', 'precip', or 'wind').
   */
  @property({ type: String })
  metric!: string;

  /**
   * Filters data to include only relevant metrics according to selected metric type.
   */
  metricFilter = getMetricFilter(() => this.metric);

  /**
   * Builds display name for metrics including location and unit.
   */
  getMetricName = getMetricNameExt(() => this.averageYears);

  render() {
    return this.data.map((location) =>
      location.weather
        .filter((weather) => this.metricFilter(weather.metric))
        .map(
          ({ metric, regression }) => html`
            <p>
              The ${this.getMetricName(metric, location.location)} is
              ${(regression.results.coefficients.at(-1) ?? 0) > 0
                ? 'increasing'
                : 'decreasing'}
              ${regression.results.coefficients.length === 2
                ? `at a rate of ${toNearestThousandth(
                    regression.results.coefficients[1] * 365.25
                  )}${getUnit(metric)} per year`
                : 'in the most recent years'}.
              This relationship between the metric and the date is
              ${regression.results.testResults.significant
                ? ''
                : 'not '}statistically
              significant with a P-Value of
              ${toNearestThousandth(regression.results.testResults.pValue)}.
              ${toNearestThousandth(regression.results.rSquared * 100)}% of the
              variation in ${this.getMetricName(metric, location.location)} can
              be explained by the
              ${getDegreeText(regression.results.coefficients.length - 1)}
              relationship with the date.
            </p>
          `
        )
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'regression-results': RegressionResults;
  }
}
