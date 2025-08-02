import { LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Textfield } from '@spectrum-web-components/textfield';
import { NumberField } from '@spectrum-web-components/number-field';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/field-group/sp-field-group.js';
import '@spectrum-web-components/checkbox/sp-checkbox.js';
import { FieldGroup } from '@spectrum-web-components/field-group';

const DEFAULT_END_YEAR = new Date().getFullYear() - 1;
const DEFAULT_START_YEAR = DEFAULT_END_YEAR - 30;

/**
 * A web component for configuring a weather analysis query.
 * Allows users to input multiple locations, select metrics, and specify regression parameters.
 *
 * @element weather-form
 *
 * @query {FieldGroup} metricInput - The container holding metric checkboxes
 * @query {NumberField} averageYearsInput - Field for moving average duration
 * @query {NumberField} startYearInput - Field for query start year
 * @query {NumberField} endYearInput - Field for query end year
 * @query {NumberField} regressionDegreeInput - Field for regression polynomial degree
 *
 * @state {Array<{id: number, value: string}>} locations - List of location text inputs
 *
 * Events:
 * - Dispatches 'form-submit' with user-selected parameters when the form is submitted
 */
@customElement('weather-form')
export class WeatherForm extends LitElement {
  @query('#metrics') metricInput!: FieldGroup;
  @query('#average-years') averageYearsInput!: NumberField;
  @query('#start-year') startYearInput!: NumberField;
  @query('#end-year') endYearInput!: NumberField;
  @query('#regression-degree') regressionDegreeInput!: NumberField;

  /** Holds selected weather locations */
  @state()
  private locations: { id: number; value: string }[] = [
    { id: Date.now(), value: '' }
  ];

  /**
   * Handles submission of the form by extracting input values
   * and dispatching a 'form-submit' event.
   *
   * @param e - The submit event
   */
  private _handleSubmit(e: Event) {
    e.preventDefault();

    const locations = this.locations.map((loc) => loc.value);

    const metrics = Array.from(
      this?.metricInput?.getElementsByTagName('sp-checkbox')
    )
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute('data-value'));
    const averageYears = this?.averageYearsInput?.value;
    const startYear = this?.startYearInput?.value;
    const endYear = this?.endYearInput?.value;
    const regressionDegree = this.regressionDegreeInput?.value;

    const formValues = {
      locations,
      metrics,
      averageYears,
      startYear,
      endYear,
      regressionDegree
    };

    this.dispatchEvent(
      new CustomEvent('form-submit', {
        detail: formValues,
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Ensures number fields fall back to default if cleared or invalid.
   *
   * @param defaultValue - Default value to restore
   * @returns Event handler for keyboard interaction
   */
  private _resetNumberInput(defaultValue: number) {
    return (e: KeyboardEvent) => {
      const target = e?.target as NumberField;
      if (isNaN(target?.value)) {
        target.value = defaultValue;
      }
    };
  }

  /**
   * Adds a new location input field to the form.
   */
  private _addLocation() {
    this.locations = [...this.locations, { id: Date.now(), value: '' }];
  }

  /**
   * Removes a location field from the form.
   *
   * @param id - ID of the location entry to remove
   */
  private _removeLocation(id: number) {
    this.locations = this.locations.filter((loc) => loc.id !== id);
  }

  /**
   * Updates the text value of a location input field.
   *
   * @param id - ID of the location entry
   * @param e - Input event from text field
   */
  private _updateLocationValue(id: number, e: InputEvent) {
    const input = e.target as Textfield;
    this.locations = this.locations.map((loc) =>
      loc.id === id ? { ...loc, value: input.value } : loc
    );
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        ${this.locations.map(
          (loc, index) => html`
            <div class="form-input location-wrapper">
              <sp-field-label for="loc-${loc.id}"
                >Location ${index + 1}</sp-field-label
              >
              <div>
                <sp-textfield
                  id="loc-${loc.id}"
                  class="location-input"
                  .value=${loc.value}
                  @input=${(e: InputEvent) =>
                    this._updateLocationValue(loc.id, e)}
                ></sp-textfield>
                ${this.locations.length > 1
                  ? html`
                      <sp-button
                        variant="secondary"
                        @click=${() => this._removeLocation(loc.id)}
                        >Remove</sp-button
                      >
                    `
                  : null}
              </div>
            </div>
          `
        )}
        <sp-button @click=${this._addLocation} variant="accent"
          >Add Location</sp-button
        >
        <div class="form-input">
          <sp-field-label for="metrics">Metrics</sp-field-label>
          <sp-field-group id="metrics">
            <sp-checkbox data-value="AVERAGE_TEMPERATURE"
              >Average Temperature</sp-checkbox
            >
            <sp-checkbox data-value="AVERAGE_APPARENT_TEMPERATURE"
              >Average Apparent Temperature</sp-checkbox
            >
            <sp-checkbox data-value="PRECIPITATION">Precipitation</sp-checkbox>
            <sp-checkbox data-value="SNOWFALL">Snowfall</sp-checkbox>
            <sp-checkbox data-value="MAX_WIND_SPEED"
              >Max Wind Speed</sp-checkbox
            >
          </sp-field-group>
        </div>
        <div class="form-input">
          <sp-field-label for="average-years"
            >Years to Include in Moving Average</sp-field-label
          >
          <sp-number-field
            id="average-years"
            min="1"
            max="10"
            step="1"
            value="1"
            @change=${this._resetNumberInput(1)}
          ></sp-number-field>
        </div>
        <div class="form-input">
          <sp-field-label for="start-year">Start Year</sp-field-label>
          <sp-number-field
            id="start-year"
            .min=${1950}
            .max=${DEFAULT_END_YEAR}
            step="1"
            .value=${DEFAULT_START_YEAR}
            .formatOptions=${{ useGrouping: false }}
            @change=${this._resetNumberInput(DEFAULT_START_YEAR)}
          ></sp-number-field>
        </div>
        <div class="form-input">
          <sp-field-label for="end-year">End Year</sp-field-label>
          <sp-number-field
            id="end-year"
            .min=${1951}
            .max=${DEFAULT_END_YEAR}
            step="1"
            .value=${DEFAULT_END_YEAR}
            .formatOptions=${{ useGrouping: false }}
            @change=${this._resetNumberInput(DEFAULT_END_YEAR)}
          ></sp-number-field>
        </div>
        <div class="form-input">
          <sp-field-label for="end-year">Regression Degree</sp-field-label>
          <sp-number-field
            id="regression-degree"
            .min=${1}
            .max=${5}
            step="1"
            .value=${1}
            @change=${this._resetNumberInput(1)}
          ></sp-number-field>
        </div>
        <div class="form-input">
          <sp-button type="submit">Submit</sp-button>
        </div>
        <div class="fine-print">
          All metrics are calculated per-day, and each day in the specified
          moving average range in years will be averaged to produce the final
          result.
        </div>
      </form>
    `;
  }

  static styles = css`
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-input {
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: center;
      width: 100%;
    }
    .fine-print {
      color: gray;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-form': WeatherForm;
  }
}
