import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import './metric-results.ts';

/**
 * A web component that displays `<metric-results>` sections
 * for selected weather metrics based on fetched data.
 *
 * @element weather-results
 *
 * @property {Data[]} data - Organized weather data across locations and metrics
 * @property {number} averageYears - Number of years used for moving averages
 *
 * Behavior:
 * - Determines which metric groups to render: temperature, precipitation/snowfall, or wind
 * - Dynamically inserts `<metric-results>` components per matched category
 * - Uses `data[0].weather` to infer which categories are available
 */
@customElement('weather-results')
export class WeatherResults extends LitElement {
  /**
   * Weather and regression data passed from parent component.
   */
  @property({ type: Array })
  data!: Data[];

  /**
   * Number of years for moving average, forwarded to child components.
   */
  @property({ type: Number })
  averageYears!: number;

  render() {
    const markup = [];
    const weather = this.data[0].weather;
    if (weather.find((item) => item.metric.includes('TEMPERATURE'))) {
      markup.push(html`<metric-results
        .metric=${'temp'}
        .data=${this.data}
        .averageYears=${this.averageYears}
      ></metric-results>`);
    }

    if (
      weather.find(
        (item) =>
          item.metric.includes('SNOWFALL') ||
          item.metric.includes('PRECIPITATION')
      )
    ) {
      markup.push(html`<metric-results
        .metric=${'precip'}
        .data=${this.data}
        .averageYears=${this.averageYears}
      ></metric-results>`);
    }

    if (weather.find((item) => item.metric.includes('WIND'))) {
      markup.push(html`<metric-results
        .metric=${'wind'}
        .data=${this.data}
        .averageYears=${this.averageYears}
      ></metric-results>`);
    }

    return markup;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-results': WeatherResults;
  }
}
