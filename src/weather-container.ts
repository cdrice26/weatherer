import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Data, fetchData } from './utils/fetchData.ts';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
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
  private _data!: Data[];

  @state()
  private _averageYears!: number;

  private async _handleSubmit(e: CustomEvent) {
    const detail = e?.detail;
    this._averageYears = detail.averageYears;
    this._loaded = false;
    this._loading = true;
    try {
      this._data = await fetchData(detail);
    } catch (e) {
      this._error = true;
    } finally {
      this._loading = false;
      this._loaded = true;
    }
  }

  render() {
    return html`<weather-form @form-submit=${this._handleSubmit}></weather-form>
      ${this._loading
        ? html`<div class="weather-results centered">
            <sp-field-label for="loading-circle"
              >Crunching numbers. This might take several
              seconds.</sp-field-label
            >
            <sp-progress-circle
              id="loading-circle"
              indeterminate
            ></sp-progress-circle>
          </div>`
        : this._error
        ? html`<div class="error weather-results centered">
            An error occurred fetching weather data. Please try again later.
          </div>`
        : this._loaded
        ? html`<weather-results
            class="weather-results"
            .data=${this._data}
            .averageYears=${this._averageYears}
          ></weather-results>`
        : html`<div class="weather-results centered">
            Once you choose your data, you'll see results here.
          </div>`}`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      gap: 10px;
      height: 100%;
      box-sizing: border-box;
      padding: 10px;

      /* Responsive layout switch */
      @media (max-width: 768px) {
        flex-direction: column;
        height: auto;
      }
    }

    .centered {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 4px;
    }

    weather-form,
    .weather-results {
      padding: 10px;
      border: 2px solid grey;
      border-radius: 15px;
      box-sizing: border-box;
      flex: 1 1 45%;
      height: 100%;
      overflow: auto; /* enables independent scrolling */
    }

    @media (max-width: 768px) {
      weather-form,
      .weather-results {
        flex: none;
        width: 100%;
        height: unset;
        overflow: visible; /* default scrolling behavior */
      }
    }

    .weather-results {
      flex-grow: 1;
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
