import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './weather-form.ts';

@customElement('weather-container')
export class WeatherContainer extends LitElement {
  private async _handleSubmit(e: CustomEvent) {
    const detail = e?.detail;
    console.log(detail);
  }

  render() {
    return html`<weather-form
      @form-submit=${this._handleSubmit}
    ></weather-form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-container': WeatherContainer;
  }
}
