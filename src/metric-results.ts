import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import './regression-results.ts';
import './weather-chart.ts';

/**
 * A web component that displays weather data and regression results
 * for a selected metric across multiple locations.
 *
 * @element metric-results
 *
 * @property {Data[]} data - Organized weather and regression data for multiple locations
 * @property {number} averageYears - The number of years used for moving average calculations
 * @property {string} metric - Selected metric category ('temp', 'precip', or 'wind')
 *
 * @example
 * <metric-results
 *   .data=${data}
 *   .averageYears=${5}
 *   .metric=${'temp'}
 * ></metric-results>
 *
 * Displays:
 * - A heading representing the metric type
 * - A weather chart visualization
 * - Regression results for the selected metric
 */
@customElement('metric-results')
export class MetricResults extends LitElement {
  /**
   * The main dataset containing historical and regression data for rendering.
   */
  @property({ type: Array })
  data!: Data[];

  /**
   * Number of years to average over when displaying trends.
   */
  @property({ type: Number })
  averageYears!: number;

  /**
   * Type of metric selected (e.g. 'temp', 'precip', 'wind') to determine chart content.
   */
  @property({ type: String })
  metric!: string;

  render() {
    return html`
      <h1>
        ${this.metric === 'temp'
          ? 'Temperature'
          : this.metric === 'precip'
          ? 'Precipitation'
          : 'Wind'}
      </h1>
      <h2>Chart</h2>
      <weather-chart
        .metric=${this.metric}
        .data=${this.data}
        .averageYears=${this.averageYears}
      ></weather-chart>
      <h2>Regression</h2>
      <regression-results
        .metric=${this.metric}
        .data=${this.data}
        .averageYears=${this.averageYears}
      ></regression-results>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'metric-results': MetricResults;
  }
}
