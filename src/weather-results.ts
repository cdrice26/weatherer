import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('weather-results')
export class WeatherResults extends LitElement {
  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-results': WeatherResults;
  }
}
