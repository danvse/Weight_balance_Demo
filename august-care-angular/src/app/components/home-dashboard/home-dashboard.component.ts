import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareStateService } from '../../services/care-state.service';
import { CustomIconComponent } from '../custom-icon/custom-icon.component';
import { WeightTrendChartComponent } from '../weight-trend-chart/weight-trend-chart.component';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [RouterLink, CustomIconComponent, WeightTrendChartComponent],
  template: `
    <div class="space-y-6">
      <!-- Urgent Red Alert Banner (>2 lbs weight change) -->
      @if (metrics().isConcerning) {
        <div class="p-5 bg-white border-2 border-red-500 rounded-3xl shadow-xl space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 alert-beacon">
                <app-icon name="alertSiren" iconClass="w-6 h-6" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-extrabold uppercase tracking-wider text-red-700">Concerning Weight Alert (&gt;2 lbs)</span>
                  <span class="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-full">ALARM ACTIVE</span>
                </div>
                <p class="text-xs sm:text-sm text-august-dark font-medium pt-1">
                  Weight change of <b class="text-red-700 font-black">{{ maxDeltaFormatted() }}</b> detected from your mattress scale. Your prescriber has been sent an automatic update.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <a
                routerLink="/chat"
                class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <app-icon name="chat" iconClass="w-4 h-4" />
                <span>Message Prescriber</span>
              </a>
              <button
                type="button"
                (click)="care.playAlarmChime()"
                class="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl hover:bg-red-100 flex items-center gap-1.5 transition"
              >
                <app-icon name="soundWave" iconClass="w-4 h-4" />
                <span>Alarm Sound</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Urgent Clinical Symptom Banner (Shortness of Breath at Rest) -->
      @if (care.symptomGateCompleted() && care.todaySymptoms().shortnessOfBreath === 'rest') {
        <div class="p-5 bg-amber-50 border-2 border-red-400 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <app-icon name="lungs" iconClass="w-6 h-6" />
            </div>
            <div>
              <div class="text-sm font-extrabold uppercase tracking-wider text-red-800">Urgent Symptom Check: Breathing Trouble at Rest</div>
              <p class="text-xs sm:text-sm text-august-dark font-medium pt-1">
                You reported shortness of breath even at rest. Please message Dr. Miller right away or seek urgent clinical evaluation if symptoms worsen.
              </p>
            </div>
          </div>
          <a
            routerLink="/chat"
            class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <app-icon name="chat" iconClass="w-4 h-4" />
            <span>Message Prescriber Now</span>
          </a>
        </div>
      }

      <!-- Two-Column Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column (7 cols): Daily Weight Stats + Screen Time Trend + Block 1 (Weight Table) -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Hero Weight Stats & Chart -->
          <div
            [class]="metrics().isConcerning
              ? 'bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-5 transition-all alert-card-highlight'
              : 'bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-5 transition-all'"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-august-warmGray">
                  <app-icon name="mattressScale" iconClass="w-4 h-4 text-august-forest" />
                  <span>Daily Mattress Weight</span>
                </div>
                <div class="flex flex-wrap items-baseline gap-2.5 pt-1">
                  <span class="text-4xl sm:text-5xl font-serif font-bold text-august-dark">{{ metrics().latestWeight.toFixed(1) }}</span>
                  <span class="text-lg font-bold text-august-warmGray">lbs</span>
                  <span
                    [class]="metrics().isConcerning
                      ? 'text-xs px-3 py-1 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1.5 border border-red-200'
                      : 'text-xs px-3 py-1 rounded-full font-bold bg-august-sage text-august-forest flex items-center gap-1.5 border border-emerald-200'"
                  >
                    <app-icon name="trendUp" iconClass="w-3.5 h-3.5" />
                    <span>{{ care.formatDelta(metrics().overnightDelta) }} overnight • {{ metrics().isConcerning ? 'Concerning (>2 lbs)' : 'Stable' }}</span>
                  </span>
                </div>
                <span class="text-[11px] text-august-warmGray block mt-1">Mattress sync: Today {{ metrics().syncTime }}</span>
              </div>

              <div class="bg-august-ivory p-3.5 rounded-2xl border border-august-border sm:text-right">
                <span class="text-[10px] text-august-warmGray block uppercase font-bold tracking-wider">Baseline Weight</span>
                <span class="text-xl font-serif font-bold text-august-dark">{{ metrics().baseline.toFixed(1) }} lbs</span>
              </div>
            </div>

            <app-weight-trend-chart />
          </div>

          <!-- BLOCK 1: Table with Weight Changes & Morning Symptoms Over the Past Few Days -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-august-sage text-august-forest flex items-center justify-center">
                  <app-icon name="weightTable" iconClass="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-august-dark">Weight &amp; Symptom Log (Past Few Days)</h3>
                  <p class="text-xs text-august-warmGray">Daily mattress readings, weight changes, and morning check-ins</p>
                </div>
              </div>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-august-ivory border border-august-border text-august-dark font-semibold">5-Day Log</span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-august-border">
              <table class="w-full text-left border-collapse">
                <thead class="bg-august-ivory text-[11px] text-august-warmGray font-bold uppercase tracking-wider border-b border-august-border">
                  <tr>
                    <th class="py-3 px-4">Day</th>
                    <th class="py-3 px-3">Weight</th>
                    <th class="py-3 px-3">Change</th>
                    <th class="py-3 px-3">Morning Symptoms</th>
                    <th class="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-august-border text-august-dark">
                  @for (row of recentRows(); track row.id) {
                    <tr [class]="row.isConcerning ? 'bg-red-50/70 transition' : 'hover:bg-august-ivory/60 transition'">
                      <td class="py-3 px-4">
                        <div class="font-bold text-august-dark text-xs sm:text-sm">{{ row.dateLabel }}</div>
                        <div class="text-[10px] text-august-warmGray">{{ row.syncTime }}</div>
                      </td>
                      <td class="py-3 px-3 font-serif font-bold text-base text-august-dark whitespace-nowrap">{{ row.weight.toFixed(1) }} lbs</td>
                      <td [class]="row.isConcerning ? 'py-3 px-3 font-bold text-xs sm:text-sm text-red-700 whitespace-nowrap' : 'py-3 px-3 font-bold text-xs sm:text-sm text-august-dark whitespace-nowrap'">
                        {{ care.formatDelta(row.delta) }}
                      </td>
                      <td class="py-3 px-3">
                        <div class="flex flex-wrap gap-1">
                          @for (chip of row.symptomChips; track chip) {
                            <span
                              [class]="row.symptomSeverity === 'severe'
                                ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700'
                                : row.symptomSeverity === 'mild'
                                  ? 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800'
                                  : 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-august-sage text-august-forest'"
                            >
                              {{ chip }}
                            </span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right whitespace-nowrap">
                        @if (row.isConcerning) {
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                            <app-icon name="alertSiren" iconClass="w-3 h-3" />
                            <span>Concerning</span>
                          </span>
                        } @else if (row.delta > 0.5) {
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Watch
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-august-sage text-august-forest">
                            <app-icon name="checkSeal" iconClass="w-3 h-3" />
                            <span>Stable</span>
                          </span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column (5 cols): 7-Day Morning Check-In Card, Block 2 (Prescriber Updates), Block 3 (Last Visit), Diuretics -->
        <div class="lg:col-span-5 space-y-6">
          <!-- 7-Day Morning Health Check Tracker & Edit Card -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-august-border">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-august-sage text-august-forest flex items-center justify-center">
                  <app-icon name="lungs" iconClass="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-august-dark">Morning Health Check Log</h3>
                  <p class="text-xs text-august-warmGray">{{ care.checkInCountLast7Days() }} of 7 days completed • Tap any day to inspect</p>
                </div>
              </div>
              <button
                type="button"
                (click)="care.reopenSymptomGate()"
                class="px-3 py-1.5 rounded-xl bg-august-ivory hover:bg-august-sage border border-august-border text-xs font-bold text-august-forest transition shrink-0"
              >
                Edit Today's Answers
              </button>
            </div>

            <!-- 7-Day Interactive Pill Strip -->
            <div class="grid grid-cols-7 gap-1.5">
              @for (day of sevenDayCheckIns(); track day.id) {
                <button
                  type="button"
                  (click)="selectedCheckInId.set(day.id)"
                  [class]="selectedCheckInId() === day.id
                    ? 'p-2 rounded-2xl border-2 border-august-forest bg-august-ivory flex flex-col items-center gap-1 transition shadow-xs'
                    : 'p-2 rounded-2xl border border-august-border bg-white hover:bg-august-ivory/60 flex flex-col items-center gap-1 transition'"
                >
                  <span class="text-[9px] font-bold uppercase text-august-warmGray">{{ day.shortDay }}</span>
                  <span
                    [class]="!day.logged
                      ? 'w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center'
                      : day.severity === 'severe'
                        ? 'w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center'
                        : day.severity === 'mild'
                          ? 'w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black flex items-center justify-center'
                          : 'w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center'"
                  >
                    {{ !day.logged ? '•' : day.severity === 'clear' ? '✓' : '!' }}
                  </span>
                </button>
              }
            </div>

            <!-- Selected Day Inspection Detail -->
            @if (selectedCheckInDay(); as sel) {
              <div class="p-3.5 rounded-2xl bg-august-ivory border border-august-border text-xs space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-august-dark">{{ sel.dateLabel }} ({{ sel.fullDate }})</span>
                  <span class="text-[11px] font-semibold text-august-warmGray">
                    Weight: <b class="text-august-dark">{{ sel.weight.toFixed(1) }} lbs</b>
                    @if (sel.symptoms?.submittedAt) {
                      • Logged {{ sel.symptoms?.submittedAt }}
                    }
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5 pt-0.5">
                  @for (chip of sel.chips; track chip) {
                    <span
                      [class]="sel.severity === 'severe'
                        ? 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700'
                        : sel.severity === 'mild'
                          ? 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800'
                          : 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-august-sage text-august-forest'"
                    >
                      {{ chip }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- BLOCK 2: Updates from the Prescriber -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2.5 border-b border-august-border">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-august-sage text-august-forest flex items-center justify-center">
                  <app-icon name="stethoscope" iconClass="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-august-dark">Updates from Prescriber</h3>
                  <p class="text-xs text-august-warmGray">{{ care.prescriberUpdate().author }} • {{ care.prescriberUpdate().specialty }}</p>
                </div>
              </div>
              <span class="text-[11px] text-august-warmGray font-medium">{{ care.prescriberUpdate().timestamp }}</span>
            </div>

            <div class="p-4 rounded-2xl bg-august-ivory border border-august-border space-y-3.5">
              <p class="text-xs sm:text-sm text-august-dark leading-relaxed">"{{ care.prescriberUpdate().message }}"</p>
              <div class="pt-2.5 border-t border-august-border flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  (click)="care.acknowledgePrescriberUpdate()"
                  [class]="care.prescriberUpdate().acknowledged
                    ? 'px-3 py-1.5 rounded-xl bg-august-sage text-august-forest text-xs font-bold flex items-center gap-1.5'
                    : 'px-3 py-1.5 rounded-xl bg-august-forest hover:bg-august-forestHover text-white text-xs font-bold flex items-center gap-1.5 transition'"
                >
                  <app-icon name="checkSeal" iconClass="w-3.5 h-3.5" />
                  <span>{{ care.prescriberUpdate().acknowledged ? 'Acknowledged' : 'Mark as Read' }}</span>
                </button>
                <a routerLink="/chat" class="text-xs font-bold text-august-forest hover:underline flex items-center gap-1">
                  <span>Ask a question in Chat</span>
                  <app-icon name="arrowRight" iconClass="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <!-- BLOCK 3: Last Visit to Prescriber -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2.5 border-b border-august-border">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <app-icon name="calendarVisit" iconClass="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-august-dark">Last Visit to Prescriber</h3>
                  <p class="text-xs text-august-warmGray">Clinical checkup timeline</p>
                </div>
              </div>
              <a routerLink="/profile" class="text-xs text-august-forest font-bold hover:underline">Update Date</a>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 rounded-2xl bg-august-ivory border border-august-border space-y-1">
                <span class="text-[10px] text-august-warmGray uppercase tracking-wider font-bold">Last Visit Date</span>
                <div class="font-serif font-bold text-august-dark text-lg">{{ care.formatFriendlyDate(care.patient().lastVisitDate) }}</div>
                <span class="text-xs text-emerald-700 font-semibold block">{{ care.daysSinceLastVisit() }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-august-ivory border border-august-border space-y-1">
                <span class="text-[10px] text-august-warmGray uppercase tracking-wider font-bold">Next Visit</span>
                <div class="font-serif font-bold text-august-dark text-lg">{{ care.formatFriendlyDate(care.patient().nextVisitDate) }}</div>
                <span class="text-xs text-august-forest font-semibold block">Cardiology Follow-up</span>
              </div>
            </div>
          </div>

          <!-- Active Diuretics Quick Check -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 font-bold text-august-dark text-sm">
                <app-icon name="pillDiuretic" iconClass="w-5 h-5 text-august-forest" />
                <span>Today's Diuretics</span>
              </div>
              <a routerLink="/profile" class="text-xs text-august-forest font-bold hover:underline">Edit Meds</a>
            </div>

            <div class="space-y-2">
              @for (med of diuretics(); track med.id) {
                <div class="p-3 bg-august-ivory rounded-2xl border border-august-border flex items-center justify-between">
                  <div>
                    <div class="font-bold text-august-dark text-xs">{{ med.name }}</div>
                    <div class="text-[11px] text-august-warmGray">{{ med.dose }} • {{ med.frequency }}</div>
                  </div>
                  <button
                    type="button"
                    (click)="care.toggleMedicationTaken(med.id)"
                    [class]="med.takenToday
                      ? 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-august-sage text-august-forest transition'
                      : 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-august-border text-august-warmGray hover:border-august-forest transition'"
                  >
                    {{ med.takenToday ? '✓ Taken today' : 'Mark taken' }}
                  </button>
                </div>
              } @empty {
                <div class="text-xs text-august-warmGray py-2">No diuretics listed. Add medications in Profile.</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Concerning Weight Alarm Modal -->
    @if (care.symptomGateCompleted() && metrics().isConcerning && !care.alertAcknowledged()) {
      <div class="fixed inset-0 bg-red-950/70 backdrop-blur-xs z-40 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-500 space-y-5 animate-slide-up text-center">
          <div class="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto alert-beacon">
            <app-icon name="alertSiren" iconClass="w-9 h-9" />
          </div>
          <div class="space-y-1.5">
            <span class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-black uppercase tracking-wider">Urgent Weight Alert</span>
            <h3 class="text-2xl font-serif font-bold text-august-dark pt-1">Concerning Weight Change Detected</h3>
            <p class="text-xs text-august-warmGray leading-relaxed">
              Your mattress scale measured <b class="text-august-dark">{{ metrics().latestWeight.toFixed(1) }} lbs</b> (<b class="text-red-600">{{ maxDeltaFormatted() }}</b>), which exceeds your 2.0 lb safety limit. Your prescriber has been alerted.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2.5">
            <a
              routerLink="/chat"
              (click)="care.acknowledgeWeightAlert()"
              class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <app-icon name="chat" iconClass="w-4 h-4" />
              <span>Chat with Prescriber</span>
            </a>
            <button
              type="button"
              (click)="care.acknowledgeWeightAlert()"
              class="flex-1 py-3 bg-august-ivory hover:bg-slate-100 border border-august-border text-august-dark font-bold text-xs rounded-xl transition"
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HomeDashboardComponent {
  readonly care = inject(CareStateService);
  readonly metrics = this.care.clinicalMetrics;

  readonly selectedCheckInId = signal<number>(7);

  readonly maxDeltaFormatted = computed(() =>
    this.care.formatDelta(Math.max(this.metrics().overnightDelta, this.metrics().baselineDelta))
  );

  readonly diuretics = computed(() =>
    this.care.patient().medications.filter(m => m.isDiuretic)
  );

  readonly recentRows = computed(() => {
    const history = this.care.weightHistory();
    const baseline = this.metrics().baseline;
    return history.slice(0, 5).map((row, idx) => {
      const older = history[idx + 1];
      const delta = older ? Number((row.weight - older.weight).toFixed(1)) : 0.0;
      const vsBase = Number((row.weight - baseline).toFixed(1));
      const isConcerning = delta > 2.0 || (idx === 0 && vsBase > 2.0);
      return {
        ...row,
        delta,
        isConcerning,
        symptomChips: this.care.formatSymptomChips(row.symptoms),
        symptomSeverity: this.care.getSymptomSeverity(row.symptoms)
      };
    });
  });

  readonly sevenDayCheckIns = computed(() =>
    this.care
      .weightHistory()
      .slice()
      .reverse()
      .map(row => ({
        ...row,
        shortDay: row.dateLabel === 'Today' ? 'Today' : row.fullDate.replace('Nov ', 'N'),
        logged: Boolean(row.symptoms?.submittedAt),
        severity: this.care.getSymptomSeverity(row.symptoms),
        chips: this.care.formatSymptomChips(row.symptoms)
      }))
  );

  readonly selectedCheckInDay = computed(() => {
    const days = this.sevenDayCheckIns();
    return days.find(d => d.id === this.selectedCheckInId()) ?? days[days.length - 1];
  });
}
