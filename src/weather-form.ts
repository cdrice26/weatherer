import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { Textfield } from '@spectrum-web-components/textfield';
import { Picker } from '@spectrum-web-components/picker';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/button/sp-button.js';
import { NumberField } from '@spectrum-web-components/number-field';

const DEFAULT_END_YEAR = new Date().getFullYear() - 1;
const DEFAULT_START_YEAR = DEFAULT_END_YEAR - 30;

@customElement('weather-form')
export class WeatherForm extends LitElement {
  @query('#location') locationInput!: Textfield;
  @query('#metric') metricInput!: Picker;
  @query('#average-years') averageYearsInput!: NumberField;
  @query('#start-year') startYearInput!: NumberField;
  @query('#end-year') endYearInput!: NumberField;

  handleSubmit(e: Event) {
    e.preventDefault();

    const location = this?.locationInput?.value;
    const metric = this?.metricInput?.value;
    const averageYears = this?.averageYearsInput?.value;
    const startYear = this?.startYearInput?.value;
    const endYear = this?.endYearInput?.value;

    const formValues = {
      location,
      metric,
      averageYears,
      startYear,
      endYear
    };

    console.log(formValues);

    this.dispatchEvent(
      new CustomEvent('form-submit', {
        detail: formValues,
        bubbles: true,
        composed: true
      })
    );
  }

  resetNumberInput(defaultValue: number) {
    return (e: KeyboardEvent) => {
      const target = e?.target as NumberField;
      if (isNaN(target?.value)) {
        target.value = defaultValue;
      }
    };
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <div class="form-input">
          <sp-field-label for="location">Location</sp-field-label>
          <sp-textfield id="location"></sp-textfield>
        </div>
        <div class="form-input">
          <sp-field-label for="metric">Metric</sp-field-label>
          <sp-picker id="metric" value="averageTemperature">
            <sp-menu-item value="averageTemperature"
              >Average Temperature</sp-menu-item
            >
            <sp-menu-item value="averageApparentTemperature"
              >Average Apparent Temperature</sp-menu-item
            >
            <sp-menu-item value="precipitation">Precipitation</sp-menu-item>
            <sp-menu-item value="snowfall">Snowfall</sp-menu-item>
            <sp-menu-item value="maxWindSpeed">Max Wind Speed</sp-menu-item>
          </sp-picker>
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
            @change=${this.resetNumberInput(1)}
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
            @change=${this.resetNumberInput(DEFAULT_START_YEAR)}
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
