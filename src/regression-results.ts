import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData';
import {
  getMetricFilter,
  getMetricName as getMetricNameExt,
  getUnit
} from './utils/getters';
import { getDegreeText } from './utils/polynomialDegree';

@customElement('regression-results')
export class RegressionResults extends LitElement {
  @property({ type: Array })
  data!: Data[];

  @property({ type: Number })
  averageYears!: number;

  @property({ type: String })
  metric!: string;

  metricFilter = getMetricFilter(() => this.metric);

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
                ? ` at a rate of ${regression.results.coefficients[1]}${getUnit(
                    metric
                  )} per year`
                : ''}.
              This increasing is
              ${regression.results.testResults.significant
                ? ''
                : 'not '}statistically
              significant with a P-Value of
              ${regression.results.testResults.pValue}.
              ${regression.results.rSquared * 100}% of the variation in
              ${this.getMetricName(metric, location.location)} can be explained
              by the
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
