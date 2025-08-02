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

const getRandomColor = () =>
  '#' +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0');

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

  private colorMap = new Map<string, string>();

  metricFilter = getMetricFilter(() => this.metric);
  getMetricName = getMetricNameExt(() => this.averageYears);

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
