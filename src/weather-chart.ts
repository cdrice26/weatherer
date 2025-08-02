import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import {
  getMetricFilter,
  getMetricName as getMetricNameExt
} from './utils/getters.ts';
import { Layout, Data as PlotlyData, PlotlyHTMLElement } from 'plotly.js-dist';
import Plotly from 'plotly.js-dist';
import { asDate } from './utils/dateUtils.ts';

/**
 * Generates a random hex color
 * @returns A random hex color
 */
const getRandomColor = () =>
  '#' +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0');

/**
 * A web component that renders interactive weather and regression charts
 * using Plotly.js for a selected metric across multiple locations.
 *
 * @element weather-chart
 *
 * @property {Data[]} data - Array of location-based weather and regression data
 * @property {number} averageYears - Number of years used for moving average trend visualization
 * @property {string} metric - Metric category to display ('temp', 'precip', or 'wind')
 *
 * Internal State:
 * - `legendData`: Holds chart legend entries including name and color per trace
 *
 * Behavior:
 * - Renders a Plotly chart with two traces per metric:
 *   - Actual daily values
 *   - Regression curve derived from polynomial coefficients
 * - Displays a custom legend showing trace names and color swatches
 * - Automatically updates chart on property change via `updated()` lifecycle
 */
@customElement('weather-chart')
export class WeatherChart extends LitElement {
  /** Input dataset with regression and historical weather data */
  @property({ type: Array })
  data!: Data[];

  /** Number of years to average for smoothing trends */
  @property({ type: Number })
  averageYears!: number;

  /** Metric type to display ('temp', 'precip', 'wind') */
  @property({ type: String })
  metric!: string;

  /** Legend entries mapped from Plotly traces */
  @state()
  legendData: { name: string; color: string }[] = [];

  /** Maps each location-metric combo to a unique color */
  private colorMap = new Map<string, string>();

  /** Filters metrics based on selected type */
  metricFilter = getMetricFilter(() => this.metric);

  /** Generates readable metric names with location and unit */
  getMetricName = getMetricNameExt(() => this.averageYears);

  /**
   * Renders Plotly chart with weather and regression data traces.
   * - Assigns unique colors per trace
   * - Computes regression curve using polynomial coefficients
   * - Extracts legend entries from chart metadata
   */
  renderChart = () => {
    const chartId = this.metric + '-chart';
    const chartDiv = this.shadowRoot?.getElementById(chartId);

    const traces = this.data.flatMap((location) =>
      location.weather
        .filter((weather) => this.metricFilter(weather.metric))
        .flatMap((weather) => {
          const thisMetric = weather.metric;
          const traceKey = `${location.location}-${thisMetric}`;

          // Assign unique color if not already set
          if (!this.colorMap.has(traceKey)) {
            this.colorMap.set(traceKey, getRandomColor());
          }

          const color = this.colorMap.get(traceKey)!;
          const metricData = weather.days.filter((day) =>
            this.metricFilter(day.metric)
          );

          const regression = weather.regression.results;
          const f = (x: number) =>
            regression.coefficients.reduce(
              (acc, coeff, index) => acc + coeff * Math.pow(x, index),
              0
            );

          return [
            {
              x: metricData.map((day) => asDate(day.date)),
              y: metricData.map((day) => day.value),
              mode: 'line',
              type: 'scatter',
              name: this.getMetricName(thisMetric, location.location),
              line: {
                color,
                width: 2
              }
            },
            {
              x: metricData.map((day) => asDate(day.date)),
              y: metricData
                .map(
                  (day) =>
                    (asDate(day.date).getTime() -
                      asDate(regression.baseDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                .map(f),
              mode: 'line',
              type: 'scatter',
              name:
                this.getMetricName(thisMetric, location.location) +
                ' (Regression)',
              line: {
                color,
                width: 4
              }
            }
          ];
        })
    );

    const layout: Partial<Layout> = {
      showlegend: false
    };

    Plotly.react(chartDiv!, traces as PlotlyData[], layout, {
      responsive: true
    });

    requestAnimationFrame(() => {
      const fullData = (chartDiv as PlotlyHTMLElement)?.data;

      if (fullData) {
        this.legendData = fullData.map((trace: any) => ({
          name: trace.name,
          color: trace.line?.color || '#ccc'
        }));
      }
    });
  };

  /**
   * Lifecycle hook that runs after property updates.
   * Re-renders the chart on each update.
   */
  updated() {
    requestAnimationFrame(this.renderChart);
  }

  render() {
    return html`
      <div
        class="chart"
        id=${this.metric + '-chart'}
        style="height: 400px"
      ></div>
      <div class="custom-legend">
        ${this.legendData.map(
          ({ name, color }) => html`
            <div class="legend-item">
              <div
                class="legend-color"
                style="background-color: ${color}"
              ></div>
              <span>${name}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = css`
    .custom-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1em;
      margin-top: 1em;
      font-size: 0.9em;
    }

    .legend-item {
      display: flex;
      align-items: center;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 6px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-chart': WeatherChart;
  }
}
