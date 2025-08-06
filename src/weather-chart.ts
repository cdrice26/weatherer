import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Data } from './utils/fetchData.ts';
import {
  getMetricFilter,
  getMetricName as getMetricNameExt
} from './utils/getters.ts';
import { asDate } from './utils/dateUtils.ts';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale
);

const getRandomColor = () =>
  '#' +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0');

@customElement('weather-chart')
export class WeatherChart extends LitElement {
  @property({ type: Array }) data!: Data[];
  @property({ type: Number }) averageYears!: number;
  @property({ type: String }) metric!: string;

  @state() legendData: { name: string; color: string }[] = [];

  private chartInstance: Chart | null = null;
  private colorMap = new Map<string, string>();
  metricFilter = getMetricFilter(() => this.metric);
  getMetricName = getMetricNameExt(() => this.averageYears);

  renderChart = () => {
    const canvasId = this.metric + '-canvas';
    const canvas = this.shadowRoot?.getElementById(
      canvasId
    ) as HTMLCanvasElement;

    if (!canvas) return;

    const datasets: any[] = [];

    this.data.forEach((location) => {
      location.weather
        .filter((weather) => this.metricFilter(weather.metric))
        .forEach((weather) => {
          const thisMetric = weather.metric;
          const traceKey = `${location.location}-${thisMetric}`;

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

          const actualDataset = {
            label: this.getMetricName(thisMetric, location.location),
            data: metricData.map((day) => ({
              x: asDate(day.date),
              y: day.value
            })),
            borderColor: color,
            borderWidth: 2,
            fill: false,
            pointRadius: 2
          };

          const futureDays = 365 * 20;
          const futureStep = 30;
          const extendedDates = Array.from(
            { length: futureDays / futureStep },
            (_, i) => {
              const futureDate = new Date(asDate(metricData.at(-1)!.date));
              futureDate.setDate(futureDate.getDate() + (i + 1) * futureStep);
              return futureDate;
            }
          );

          const extendedValues = extendedDates.map((date) => {
            const daysSinceBase =
              (date.getTime() - asDate(regression.baseDate).getTime()) /
              (1000 * 60 * 60 * 24);
            return f(daysSinceBase);
          });

          const regressionDataset = {
            label:
              this.getMetricName(thisMetric, location.location) +
              ' (Regression)',
            data: [
              ...metricData.map((day) => {
                const x = asDate(day.date);
                const daysSinceBase =
                  (x.getTime() - asDate(regression.baseDate).getTime()) /
                  (1000 * 60 * 60 * 24);
                return { x, y: f(daysSinceBase) };
              }),
              ...extendedDates.map((date, i) => ({
                x: date,
                y: extendedValues[i]
              }))
            ],
            borderColor: color,
            borderWidth: 3,
            fill: false,
            pointRadius: 0
          };

          datasets.push(actualDataset, regressionDataset);
        });
    });

    this.legendData = datasets.map((dataset) => ({
      name: dataset.label,
      color: dataset.borderColor
    }));

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'month' },
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Value' }
          }
        }
      }
    });
  };

  updated(changedProps: Map<string | number | symbol, unknown>) {
    if (
      changedProps.has('data') ||
      changedProps.has('metric') ||
      changedProps.has('averageYears')
    ) {
      requestAnimationFrame(() => this.renderChart());
    }
  }

  render() {
    return html`
      <canvas
        class="chart"
        id=${this.metric + '-canvas'}
        width="800"
        height="400"
      ></canvas>
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
    .chart {
      display: block;
      margin-bottom: 1em;
    }

    .custom-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1em;
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
