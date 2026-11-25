import { Component, computed, inject, signal } from '@angular/core';
import { ChartSeriesPoint, TimeRange } from '../../../core/models/care.models';
import { CareStateService } from '../../../core/services/care-state.service';

interface PlottedNode extends ChartSeriesPoint {
  x: number;
  y: number;
  barHeight: number;
  isHigh: boolean;
}

@Component({
  selector: 'app-weight-trend-chart',
  standalone: true,
  template: `
    <div class="space-y-4">
      <!-- Screen Time Style Period Selector -->
      <div class="bg-august-ivory p-1.5 rounded-2xl flex text-xs border border-august-border">
        @for (r of ranges; track r.id) {
          <button
            type="button"
            (click)="setRange(r.id)"
            [class]="care.currentRange() === r.id
              ? 'flex-1 py-2 px-3 rounded-xl bg-white shadow-xs text-august-forest font-bold transition'
              : 'flex-1 py-2 px-3 rounded-xl text-august-warmGray hover:text-august-dark font-semibold transition'"
          >
            {{ r.label }}
          </button>
        }
      </div>

      <!-- Summary Strip -->
      <div class="grid grid-cols-3 gap-2.5 bg-august-ivory/60 p-3 rounded-2xl border border-august-border/70 text-center">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Period Avg</span>
          <span class="text-sm font-bold text-august-dark">{{ care.formatWeight(periodAvgLbs()) }}</span>
        </div>
        <div class="border-x border-august-border">
          <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Vs. Baseline</span>
          <span [class]="latestVsBase() > 2.0 ? 'text-sm font-bold text-red-600' : 'text-sm font-bold text-august-forest'">
            {{ care.formatUnitDelta(latestVsBase()) }}
          </span>
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Alert Limit</span>
          <span class="text-sm font-bold text-august-dark">&gt; +{{ care.formatWeight(2.0) }}</span>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center text-[11px] text-august-warmGray mb-2">
          <span class="font-semibold">{{ subLabel() }}</span>
          <span>Tap or hover points</span>
        </div>

        <div class="w-full h-56 relative bg-august-ivory/35 rounded-2xl p-2 border border-august-border/60">
          @if (hoveredNode(); as tip) {
            <div
              class="absolute z-20 bg-august-dark text-white px-3 py-2 rounded-xl shadow-xl text-[11px] leading-snug min-w-[155px] pointer-events-none"
              [style.left.px]="tooltipLeft()"
              style="top: 6px"
            >
              <div class="font-bold text-white flex items-center justify-between gap-3">
                <span>{{ tip.label }}</span>
                <span [class]="tip.isHigh ? 'text-red-300' : 'text-emerald-300'">{{ care.formatWeight(tip.val) }}</span>
              </div>
              <div class="text-slate-300 text-[10px] mt-0.5">
                Vs. Baseline: <b>{{ care.formatUnitDelta(tip.deltaBase) }}</b>
              </div>
              <div class="text-slate-300 text-[10px]">
                Step Change: <b>{{ care.formatUnitDelta(tip.deltaPrev) }}</b> • {{ tip.syncTime }}
              </div>
              @if (tip.symptomSummary) {
                <div
                  class="mt-1 pt-1 border-t border-white/15 text-[10px]"
                  [class]="tip.symptomSeverity === 'severe' ? 'text-red-300 font-semibold' : tip.symptomSeverity === 'mild' ? 'text-amber-300 font-semibold' : 'text-emerald-300'"
                >
                  Check-in: {{ tip.symptomSummary }}
                </div>
              }
              @if (tip.vitals) {
                <div
                  class="text-[10px] mt-0.5 font-medium"
                  [class]="care.evaluateVitals(tip.vitals).isConcerning ? 'text-rose-300 font-bold' : 'text-sky-200'"
                >
                  {{ care.formatVitalsShort(tip.vitals) }}
                </div>
              }
              @if (tip.diureticAdherence) {
                <div
                  class="text-[10px] mt-0.5 font-semibold"
                  [class]="tip.diureticAdherence === 'missed' ? 'text-rose-300' : tip.diureticAdherence === 'partial' ? 'text-amber-300' : 'text-indigo-200'"
                >
                  Diuretic: {{ tip.diureticAdherence === 'missed' ? 'Missed dose' : tip.diureticAdherence === 'partial' ? 'Partial dose' : 'All doses taken' }}
                </div>
              }
            </div>
          }

          <svg viewBox="0 0 620 215" class="w-full h-full overflow-visible select-none">
            @for (g of chart().guides; track g.text) {
              <line x1="42" [attr.y1]="g.y" x2="548" [attr.y2]="g.y" stroke="#E8E5DA" stroke-width="1" />
              <text x="34" [attr.y]="g.y + 4" text-anchor="end" font-size="10" fill="#8A968E">{{ g.text }}</text>
            }

            <!-- Baseline Dry Weight Line -->
            <line
              x1="42"
              [attr.y1]="chart().baselineY"
              x2="556"
              [attr.y2]="chart().baselineY"
              stroke="#64748B"
              stroke-dasharray="4 4"
              stroke-width="1.8"
            />
            <text x="560" [attr.y]="chart().baselineY + 4" font-size="10.5" font-weight="700" fill="#475569">
              Base {{ care.convertWeight(chart().baseline).toFixed(1) }}
            </text>

            <defs>
              <linearGradient id="ngRpmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="chart().strokeColor" stop-opacity="0.22" />
                <stop offset="100%" [attr.stop-color]="chart().strokeColor" stop-opacity="0.01" />
              </linearGradient>
            </defs>

            <polygon [attr.points]="chart().areaPoints" fill="url(#ngRpmAreaGrad)" />
            <polyline
              fill="none"
              [attr.stroke]="chart().strokeColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.points]="chart().polyPoints"
            />

            @for (node of chart().nodes; track node.label; let idx = $index) {
              <g
                class="cursor-pointer"
                (mouseenter)="onHoverNode($event, node)"
                (click)="onHoverNode($event, node)"
                (mouseleave)="hoveredNode.set(null)"
              >
                <rect
                  [attr.x]="node.x - 14"
                  [attr.y]="node.y"
                  width="28"
                  [attr.height]="node.barHeight"
                  rx="7"
                  [attr.fill]="node.isHigh ? '#DC2626' : '#1E3F30'"
                  [attr.fill-opacity]="node.isHigh ? 0.18 : 0.09"
                />
                <rect [attr.x]="node.x - 24" y="28" width="48" height="177" fill="transparent" />
                <circle
                  [attr.cx]="node.x"
                  [attr.cy]="node.y"
                  r="6"
                  [attr.fill]="node.isHigh ? '#DC2626' : '#1E3F30'"
                  stroke="#ffffff"
                  stroke-width="2.5"
                />
                @if (node.diureticAdherence === 'missed' || node.diureticAdherence === 'partial') {
                  <circle
                    [attr.cx]="node.x"
                    [attr.cy]="node.y"
                    r="10"
                    fill="none"
                    [attr.stroke]="node.diureticAdherence === 'missed' ? '#E11D48' : '#D97706'"
                    stroke-width="1.8"
                    stroke-dasharray="3 2"
                  />
                  <text
                    [attr.x]="node.x"
                    [attr.y]="node.y + 19"
                    text-anchor="middle"
                    font-size="8.5"
                    font-weight="800"
                    [attr.fill]="node.diureticAdherence === 'missed' ? '#BE123C' : '#B45309'"
                  >
                    Rx!
                  </text>
                }
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y - 12"
                  text-anchor="middle"
                  font-size="11.5"
                  font-weight="800"
                  [attr.fill]="node.isHigh ? '#B91C1C' : '#16221D'"
                >
                  {{ care.convertWeight(node.val).toFixed(1) }}
                </text>
                <text
                  [attr.x]="node.x"
                  y="207"
                  text-anchor="middle"
                  font-size="11"
                  font-weight="600"
                  fill="#707E76"
                >
                  {{ node.label }}
                </text>
              </g>
            }
          </svg>
        </div>
      </div>
    </div>
  `
})
export class WeightTrendChartComponent {
  readonly care = inject(CareStateService);

  readonly ranges: { id: TimeRange; label: string }[] = [
    { id: 'days', label: 'Days' },
    { id: 'weeks', label: 'Weeks' },
    { id: 'months', label: 'Months' }
  ];

  readonly hoveredNode = signal<PlottedNode | null>(null);
  readonly tooltipLeft = signal<number>(20);

  readonly subLabel = computed(() => {
    const map: Record<TimeRange, string> = {
      days: 'Daily Nocturnal Weight Trend (Past 7 Days)',
      weeks: 'Weekly Average Sleep Weights (Past 6 Weeks)',
      months: 'Monthly Sleep Weight Averages (Past 6 Months)'
    };
    return map[this.care.currentRange()];
  });

  private readonly series = computed<ChartSeriesPoint[]>(() => {
    const baseline = Number(this.care.patient().baselineWeight);
    const range = this.care.currentRange();

    if (range === 'days') {
      return this.care
        .weightHistory()
        .slice()
        .reverse()
        .map((item, idx, arr) => {
          const prev = idx > 0 ? arr[idx - 1].weight : baseline;
          return {
            label: item.fullDate,
            val: item.weight,
            deltaPrev: Number((item.weight - prev).toFixed(1)),
            deltaBase: Number((item.weight - baseline).toFixed(1)),
            syncTime: item.syncTime,
            symptomSummary: this.care.formatSymptomChips(item.symptoms).join(' • '),
            symptomSeverity: this.care.getSymptomSeverity(item.symptoms),
            vitals: item.vitals,
            diureticAdherence: item.diureticAdherence
          };
        });
    }

    const src = range === 'weeks' ? this.care.weeklyHistory() : this.care.monthlyHistory();
    const syncText = range === 'weeks' ? 'Weekly Avg' : 'Monthly Avg';
    return src.map((item, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1].weight : baseline;
      return {
        label: item.label,
        val: item.weight,
        deltaPrev: Number((item.weight - prev).toFixed(1)),
        deltaBase: Number((item.weight - baseline).toFixed(1)),
        syncTime: syncText
      };
    });
  });

  readonly periodAvgLbs = computed(() => {
    const s = this.series();
    if (!s.length) return 0;
    return s.reduce((sum, item) => sum + item.val, 0) / s.length;
  });

  readonly latestVsBase = computed(() => {
    const s = this.series();
    return s.length ? s[s.length - 1].deltaBase : 0;
  });

  readonly chart = computed(() => {
    const s = this.series();
    const baseline = Number(this.care.patient().baselineWeight);
    const allVals = s.map(d => d.val).concat([baseline]);
    const minVal = Math.min(...allVals) - 1.5;
    const maxVal = Math.max(...allVals) + 1.5;
    const valRange = maxVal - minVal || 1;

    const padL = 42;
    const padR = 72;
    const padT = 28;
    const plotW = 620 - padL - padR;
    const plotH = 215 - padT - 30;

    const getX = (idx: number) => padL + (s.length > 1 ? (idx / (s.length - 1)) * plotW : plotW / 2);
    const getY = (val: number) => padT + plotH - ((val - minVal) / valRange) * plotH;

    const nodes: PlottedNode[] = s.map((d, i) => {
      const x = getX(i);
      const y = getY(d.val);
      return {
        ...d,
        x,
        y,
        barHeight: Math.max(8, padT + plotH - y),
        isHigh: d.deltaBase > 2.0 || d.deltaPrev > 2.0
      };
    });

    const polyPoints = nodes.map(n => `${n.x},${n.y}`).join(' ');
    const areaPoints = nodes.length
      ? `${nodes[0].x},${padT + plotH} ${polyPoints} ${nodes[nodes.length - 1].x},${padT + plotH}`
      : '';
    const midVal = (minVal + maxVal) / 2;

    return {
      baseline,
      baselineY: getY(baseline),
      strokeColor: this.care.clinicalMetrics().isConcerning ? '#DC2626' : '#1E3F30',
      nodes,
      polyPoints,
      areaPoints,
      guides: [
        { y: getY(maxVal - 0.3), text: this.care.convertWeight(maxVal - 0.3).toFixed(0) },
        { y: getY(midVal), text: this.care.convertWeight(midVal).toFixed(0) },
        { y: getY(minVal + 0.3), text: this.care.convertWeight(minVal + 0.3).toFixed(0) }
      ]
    };
  });

  setRange(range: TimeRange): void {
    this.care.currentRange.set(range);
    this.hoveredNode.set(null);
  }

  onHoverNode(evt: MouseEvent, node: PlottedNode): void {
    this.hoveredNode.set(node);
    const target = (evt.currentTarget as Element | null)?.closest('div');
    if (target) {
      const rect = target.getBoundingClientRect();
      this.tooltipLeft.set(Math.max(12, Math.min(rect.width - 170, evt.clientX - rect.left - 75)));
    }
  }
}
