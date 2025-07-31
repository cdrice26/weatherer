import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { APIResponse } from './utils/fetchData';

@customElement('weather-results')
export class WeatherResults extends LitElement {
  @property({ type: Object })
  data!: APIResponse;

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-results': WeatherResults;
  }
}
