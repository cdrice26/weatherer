import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Data } from './utils/fetchData.ts';
import {
  getMetricFilter,
  getMetricName as getMetricNameExt
} from './utils/getters.ts';
import { Layout, Data as PlotlyData, PlotlyHTMLElement } from 'plotly.js-dist';
import Plotly from 'plotly.js-dist';

const TRACE_COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf'
];

const getEvaluator = (coefficients: number[]) => (x: number) =>
  coefficients.reduce(
    (acc, coeff, index) => acc + coeff * Math.pow(x, index),
    0
  );

@customElement('weather-chart')
export class WeatherChart extends LitElement {
  @property({ type: Array })
  data!: Data[];

  @property({ type: Number })
  averageYears!: number;

  @property({ type: String })
  metric!: string;

  @state()
  legendData: { name: string; color: string }[] = [];

  metricFilter = getMetricFilter(() => this.metric);
  getMetricName = getMetricNameExt(() => this.averageYears);

  renderChart = () => {
    const chartId = this.metric + '-chart';
    const chartDiv = this.shadowRoot?.getElementById(chartId);
    const traces = this.data.flatMap((location, locationIndex) =>
      location.weather
        .filter((weather) => this.metricFilter(weather.metric))
        .flatMap((weather, weatherIndex) => {
          const thisMetric = weather.metric;
          const metricData = weather.days.filter((day) =>
            this.metricFilter(day.metric)
          );
          const regression = weather.regression.results;
          const f = getEvaluator(regression.coefficients);
          return [
            {
              x: metricData.map((day) => new Date(day.date)),
              y: metricData.map((day) => day.value),
              mode: 'line',
              type: 'scatter',
              name: this.getMetricName(thisMetric, location.location),
              line: {
                color:
                  TRACE_COLORS[
                    (locationIndex + weatherIndex) % TRACE_COLORS.length
                  ],
                width: 2
              }
            },
            {
              x: metricData.map((day) => new Date(day.date)),
              y: metricData
                .map(
                  (day) =>
                    (new Date(day.date).getTime() -
                      new Date(regression.baseDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                .map(f),
              mode: 'line',
              type: 'scatter',
              name:
                this.getMetricName(thisMetric, location.location) +
                ' (Regression)',
              line: {
                color:
                  TRACE_COLORS[
                    (locationIndex + weatherIndex) % TRACE_COLORS.length
                  ],
                width: 4
              }
            }
          ];
        })
    );
    const layout = {
      showlegend: false
    };
    Plotly.react(chartDiv!, traces as PlotlyData[], layout as Layout, {
      responsive: true
    });
    requestAnimationFrame(() => {
      const fullData = (chartDiv as PlotlyHTMLElement)?.data; // Plotly attaches this

      if (fullData) {
        this.legendData = fullData.map((trace: any) => ({
          name: trace.name,
          color: trace.line?.color || '#ccc'
        }));
      }
    });
  };

  updated() {
    requestAnimationFrame(this.renderChart);
  }

  render() {
    return html`<div
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
      </div>`;
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
