import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import './metric-results.ts';

@customElement('weather-results')
export class WeatherResults extends LitElement {
  @property({ type: Array })
  data!: Data[];

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
