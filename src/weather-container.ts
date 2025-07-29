import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { APIResponse, fetchData } from './utils/fetchData.ts';
import '@spectrum-web-components/divider/sp-divider.js';
import './weather-form.ts';
import './weather-results.ts';

@customElement('weather-container')
export class WeatherContainer extends LitElement {
  @state()
  private _error = false;

  @state()
  private _loaded = false;

  @state()
  private _loading = false;

  @state()
  private _data!: APIResponse;

  private async _handleSubmit(e: CustomEvent) {
    const detail = e?.detail;
    this._loaded = false;
    this._loading = true;
    try {
      this._data = await fetchData(detail);
    } catch (e) {
      this._error = true;
    } finally {
      console.log('loaded');
      this._loading = false;
      this._loaded = true;
    }
  }

  render() {
    return html`<weather-form @form-submit=${this._handleSubmit}></weather-form>
      <sp-divider></sp-divider>
      ${this._loading
        ? html`<span>Loading...</span>`
        : this._error
        ? html`<span class="error"
            >An error occurred fetching weather data. Please try again
            later.</span
          >`
        : this._loaded
        ? html`<span>Loaded successfully.</span>`
        : "Once you choose your data, you'll see results here."}`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .error {
      color: red;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-container': WeatherContainer;
  }
}
