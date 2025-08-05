import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Data, fetchData } from './utils/fetchData.ts';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import './weather-form.ts';
import './weather-results.ts';

/**
 * A container component that orchestrates the weather data workflow:
 * - Presents the input form to select parameters
 * - Fetches and stores weather analysis data
 * - Handles loading, error, and result display states
 *
 * @element weather-container
 */
@customElement('weather-container')
export class WeatherContainer extends LitElement {
  /**
   * Indicates if an error occurred during data fetch.
   */
  @state()
  private _error = false;

  /**
   * Tracks whether data has been successfully loaded.
   */
  @state()
  private _loaded = false;

  /**
   * Whether a request is in progress.
   */
  @state()
  private _loading = false;

  /**
   * Holds the fetched weather and regression data.
   */
  @state()
  private _data!: Data[];

  /**
   * Tracks the number of years used in averaging—passed to child components.
   */
  @state()
  private _averageYears!: number;

  /**
   * Handles form submission by initiating data fetch and updating state.
   *
   * @param e - Custom event emitted from `<weather-form>`
   */
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
      flex: 1;
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
