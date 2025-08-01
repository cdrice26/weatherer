import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import './regression-results.ts';

@customElement('metric-results')
export class MetricResults extends LitElement {
  @property({ type: Array })
  data!: Data[];

  @property({ type: Number })
  averageYears!: number;

  @property({ type: String })
  metric!: string;

  render() {
    return html`
      <h1>Temperature</h1>
      <h2>Chart</h2>
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
