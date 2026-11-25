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
      <!-- Refined Clinical Alert Card (>2 lbs weight change) -->
      @if (metrics().isConcerning) {
        <div class="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-rose-200 border-l-4 border-l-rose-700 rounded-3xl shadow-[0_22px_48px_-14px_rgba(69,10,10,0.42)] animate-slide-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 relative">
                <app-icon name="alertSiren" iconClass="w-6 h-6" />
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600 absolute -top-1 -right-1 alert-beacon"></span>
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider rounded-full">Clinical Fluid Alert</span>
                  <span class="text-[11px] font-semibold text-rose-700">Threshold &gt; 2.0 lbs exceeded</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-serif font-medium text-august-dark pt-1">
                  Weight Increased by <span class="text-rose-700 font-bold">{{ maxDeltaFormatted() }}</span>
                </h2>
                <p class="text-xs sm:text-sm text-august-warmGray leading-relaxed pt-0.5">
                  Your mattress scale logged a concerning fluid shift. Dr. Sarah Miller has been notified—please review your care instructions or send a message below.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 shrink-0">
              <a
                routerLink="/chat"
                class="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <app-icon name="chat" iconClass="w-4 h-4" />
                <span>Message Dr. Miller</span>
              </a>
              <button
                type="button"
                (click)="care.playAlarmChime()"
                class="px-3.5 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl hover:bg-rose-100 flex items-center gap-1.5 transition"
              >
                <app-icon name="soundWave" iconClass="w-4 h-4" />
                <span>Alert Tone</span>
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

      <!-- ============================================== -->
      <!-- HEALTH & WEIGHT GOAL OVERVIEW (4 Vibrant Tiles + Unit Toggle) -->
      <!-- ============================================== -->
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-widest text-august-warmGray">Daily Health Overview</span>
            <h2 class="text-xl sm:text-2xl font-serif font-medium text-august-dark">Weight Balance &amp; Body Metrics</h2>
          </div>

          <!-- LB / KG Toggle -->
          <div class="flex items-center gap-2">
            <div class="bg-august-ivory p-1 rounded-xl border border-august-border flex text-xs font-bold">
              <button
                type="button"
                (click)="care.weightUnit.set('lbs')"
                [class]="care.weightUnit() === 'lbs'
                  ? 'px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-xs transition'
                  : 'px-3 py-1 rounded-lg text-august-warmGray hover:text-august-dark transition'"
              >
                LB
              </button>
              <button
                type="button"
                (click)="care.weightUnit.set('kg')"
                [class]="care.weightUnit() === 'kg'
                  ? 'px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-xs transition'
                  : 'px-3 py-1 rounded-lg text-august-warmGray hover:text-august-dark transition'"
              >
                KG
              </button>
            </div>
            <a routerLink="/profile" class="text-xs font-bold text-august-forest hover:underline px-2">Edit Height &amp; Goal</a>
          </div>
        </div>

        <!-- 4 Vibrant Summary Tiles (Inspired by Health Dashboard UI) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- Tile 1: Current Weight -->
          <div class="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md relative overflow-hidden">
            <div class="text-[11px] font-semibold text-orange-100 uppercase tracking-wider">Current Weight</div>
            <div class="flex items-baseline gap-1 pt-1.5">
              <span class="text-3xl font-bold tracking-tight">{{ care.convertWeight(metrics().latestWeight).toFixed(1) }}</span>
              <span class="text-xs font-semibold text-orange-100">{{ care.weightUnit() }}</span>
            </div>
            <div class="text-[11px] text-orange-100 mt-2 font-medium">
              {{ formatUnitDelta(metrics().overnightDelta) }} since yesterday
            </div>
          </div>

          <!-- Tile 2: Weight Loss Goal -->
          <div class="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md relative overflow-hidden">
            <div class="text-[11px] font-semibold text-indigo-100 uppercase tracking-wider">Goal Weight</div>
            <div class="flex items-baseline gap-1 pt-1.5">
              <span class="text-3xl font-bold tracking-tight">{{ care.convertWeight(goal().goalWeight).toFixed(1) }}</span>
              <span class="text-xs font-semibold text-indigo-100">{{ care.weightUnit() }}</span>
            </div>
            <div class="text-[11px] text-indigo-100 mt-2 font-medium">
              {{ care.convertWeight(goal().leftLbs).toFixed(1) }} {{ care.weightUnit() }} left to goal
            </div>
          </div>

          <!-- Tile 3: Dynamic BMI (Age + Height + Weight) -->
          <div class="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-amber-50 uppercase tracking-wider">Body Mass Index</span>
              <span class="px-2 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-bold">{{ bmi().category }}</span>
            </div>
            <div class="flex items-baseline gap-1.5 pt-1.5">
              <span class="text-3xl font-bold tracking-tight">{{ bmi().score.toFixed(1) }}</span>
              <span class="text-xs font-semibold text-amber-50">BMI</span>
            </div>
            <div class="text-[11px] text-amber-50 mt-2 font-medium">
              Age {{ bmi().ageYears }} • {{ bmi().heightDisplay }}
            </div>
            <!-- Mini decorative bar texture -->
            <svg viewBox="0 0 100 22" class="w-full h-5 mt-1 opacity-35" aria-hidden="true">
              <rect x="4" y="10" width="7" height="12" rx="2" fill="white" />
              <rect x="15" y="6" width="7" height="16" rx="2" fill="white" />
              <rect x="26" y="12" width="7" height="10" rx="2" fill="white" />
              <rect x="37" y="3" width="7" height="19" rx="2" fill="white" />
              <rect x="48" y="8" width="7" height="14" rx="2" fill="white" />
              <rect x="59" y="1" width="7" height="21" rx="2" fill="white" />
              <rect x="70" y="9" width="7" height="13" rx="2" fill="white" />
              <rect x="81" y="5" width="7" height="17" rx="2" fill="white" />
            </svg>
          </div>

          <!-- Tile 4: Nocturnal Sleep & Sync -->
          <div class="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-md relative overflow-hidden">
            <div class="text-[11px] font-semibold text-sky-50 uppercase tracking-wider">Nocturnal Rest</div>
            <div class="flex items-baseline gap-1 pt-1.5">
              <span class="text-3xl font-bold tracking-tight">{{ care.patient().sleepHours }}</span>
              <span class="text-xs font-semibold text-sky-50">hr</span>
            </div>
            <div class="text-[11px] text-sky-50 mt-2 font-medium">
              Scale synced {{ metrics().syncTime }}
            </div>
            <svg viewBox="0 0 100 22" class="w-full h-5 mt-1 opacity-55" aria-hidden="true">
              <polyline fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="2,16 18,11 32,14 48,6 64,12 80,8 96,13" />
              <circle cx="48" cy="6" r="3" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TODAY'S ACTION ROW (Med Reminders + Clinic Visits Above the Fold) -->
      <!-- ============================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Quick Medication Dose Bar (7 cols) -->
        <div
          [class]="adherence().missedDiureticAlert
            ? 'lg:col-span-7 bg-rose-50/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-rose-200 shadow-sm flex flex-col justify-between gap-3'
            : 'lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-august-border shadow-sm flex flex-col justify-between gap-3'"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                [class]="adherence().missedDiureticAlert
                  ? 'w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0'
                  : 'w-9 h-9 rounded-xl bg-august-sage text-august-forest flex items-center justify-center shrink-0'"
              >
                <app-icon name="pillDiuretic" iconClass="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-august-dark">Today's Dose Reminders</h3>
                  <span
                    [class]="adherence().takenCount === adherence().totalCount
                      ? 'px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold'
                      : 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold'"
                  >
                    {{ adherence().takenCount }}/{{ adherence().totalCount }} Taken
                  </span>
                </div>
                <p class="text-[11px] text-august-warmGray">Tap a medication to check it off right away • 7d diuretics {{ adherence().sevenDayRatePercent }}%</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              @if (adherence().takenCount < adherence().totalCount) {
                <button
                  type="button"
                  (click)="care.markAllMedicationsTaken()"
                  class="px-3 py-1.5 rounded-xl bg-august-forest hover:bg-august-forestHover text-white text-[11px] font-bold transition"
                >
                  Take All Remaining
                </button>
              }
              <button
                type="button"
                (click)="isMedChecklistOpen.set(true)"
                class="px-2.5 py-1.5 rounded-xl bg-august-ivory hover:bg-august-sage border border-august-border text-[11px] font-bold text-august-forest transition"
              >
                Full Details
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (med of care.patient().medications; track med.id) {
              <button
                type="button"
                (click)="care.toggleMedicationTaken(med.id)"
                [class]="med.takenToday
                  ? 'px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-emerald-100/70'
                  : 'px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition hover:bg-amber-100 shadow-xs'"
              >
                <span>{{ med.takenToday ? '✓' : '○' }}</span>
                <span>{{ med.name }}</span>
                <span class="text-[10px] opacity-75">{{ med.dose }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Upcoming & Last Prescriber Visit Timeline (5 cols) -->
        <div class="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-august-border shadow-sm flex flex-col justify-between gap-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <app-icon name="calendarVisit" iconClass="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-august-dark">Prescriber Visits</h3>
                <p class="text-[11px] text-august-warmGray">Clinical checkup reminders</p>
              </div>
            </div>
            <a routerLink="/profile" class="text-xs text-august-forest font-bold hover:underline">Update Date</a>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-0.5">
              <span class="text-[10px] text-purple-800 uppercase tracking-wider font-bold block">Next Visit</span>
              <div class="font-serif font-bold text-august-dark text-sm sm:text-base">{{ care.formatFriendlyDate(care.patient().nextVisitDate) }}</div>
              <span class="text-[11px] text-purple-800 font-semibold block">{{ daysUntilNextVisit() }} • Follow-up</span>
            </div>
            <div class="p-3 rounded-2xl bg-august-ivory border border-august-border space-y-0.5">
              <span class="text-[10px] text-august-warmGray uppercase tracking-wider font-bold block">Last Visit</span>
              <div class="font-serif font-bold text-august-dark text-sm sm:text-base">{{ care.formatFriendlyDate(care.patient().lastVisitDate) }}</div>
              <span class="text-[11px] text-emerald-700 font-semibold block">{{ care.daysSinceLastVisit() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-Column Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column (7 cols): Weight Trend Chart, Trends Strip, & Block 1 (Weight Table) -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Hero Weight Stats & Screen-Time Chart -->
          <div
            [class]="metrics().isConcerning
              ? 'bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-5 transition-all alert-card-highlight'
              : 'bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-5 transition-all'"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-august-warmGray">
                  <app-icon name="mattressScale" iconClass="w-4 h-4 text-august-forest" />
                  <span>Daily Mattress Weight Trend</span>
                </div>
                <div class="flex flex-wrap items-baseline gap-2.5 pt-1">
                  <span class="text-4xl sm:text-5xl font-serif font-bold text-august-dark">{{ care.convertWeight(metrics().latestWeight).toFixed(1) }}</span>
                  <span class="text-lg font-bold text-august-warmGray">{{ care.weightUnit() }}</span>
                  <span
                    [class]="metrics().isConcerning
                      ? 'text-xs px-3 py-1 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1.5 border border-red-200'
                      : 'text-xs px-3 py-1 rounded-full font-bold bg-august-sage text-august-forest flex items-center gap-1.5 border border-emerald-200'"
                  >
                    <app-icon name="trendUp" iconClass="w-3.5 h-3.5" />
                    <span>{{ formatUnitDelta(metrics().overnightDelta) }} overnight • {{ metrics().isConcerning ? 'Concerning (>2 lbs)' : 'Stable' }}</span>
                  </span>
                </div>
                <span class="text-[11px] text-august-warmGray block mt-1">Mattress sync: Today {{ metrics().syncTime }}</span>
              </div>

              <div class="bg-august-ivory p-3.5 rounded-2xl border border-august-border sm:text-right">
                <span class="text-[10px] text-august-warmGray block uppercase font-bold tracking-wider">Dry Baseline</span>
                <span class="text-xl font-serif font-bold text-august-dark">{{ care.formatWeight(metrics().baseline) }}</span>
              </div>
            </div>

            <app-weight-trend-chart />

            <!-- 4-Card Trends Strip (Last 7 Days, Last 30 Days, All Time, Median) -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div class="p-3 rounded-2xl bg-august-ivory border border-august-border">
                <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Last 7 Days</span>
                <span [class]="trends().last7Days <= 0 ? 'text-base font-bold text-emerald-700' : 'text-base font-bold text-august-dark'">
                  {{ formatUnitDelta(trends().last7Days) }}
                </span>
              </div>
              <div class="p-3 rounded-2xl bg-august-ivory border border-august-border">
                <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Last 30 Days</span>
                <span [class]="trends().last30Days <= 0 ? 'text-base font-bold text-emerald-700' : 'text-base font-bold text-august-dark'">
                  {{ formatUnitDelta(trends().last30Days) }}
                </span>
              </div>
              <div class="p-3 rounded-2xl bg-august-ivory border border-august-border">
                <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Since Start</span>
                <span [class]="trends().allTime <= 0 ? 'text-base font-bold text-emerald-700' : 'text-base font-bold text-august-dark'">
                  {{ formatUnitDelta(trends().allTime) }}
                </span>
              </div>
              <div class="p-3 rounded-2xl bg-august-ivory border border-august-border">
                <span class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Median Weight</span>
                <span class="text-base font-bold text-august-dark">{{ care.formatWeight(trends().medianWeight) }}</span>
              </div>
            </div>
          </div>

          <!-- BLOCK 1: Table with Weight Changes & Morning Symptoms Over the Past Few Days -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
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
                      <td class="py-3 px-3 font-serif font-bold text-base text-august-dark whitespace-nowrap">{{ care.formatWeight(row.weight) }}</td>
                      <td [class]="row.isConcerning ? 'py-3 px-3 font-bold text-xs sm:text-sm text-red-700 whitespace-nowrap' : 'py-3 px-3 font-bold text-xs sm:text-sm text-august-dark whitespace-nowrap'">
                        {{ formatUnitDelta(row.delta) }}
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
                          <span
                            [class]="row.diureticAdherence === 'missed'
                              ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700'
                              : row.diureticAdherence === 'partial'
                                ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800'
                                : 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700'"
                          >
                            {{ row.diureticAdherence === 'missed' ? 'Diuretic Missed' : row.diureticAdherence === 'partial' ? 'Partial Rx' : 'Diuretics ✓' }}
                          </span>
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

        <!-- Right Column (5 cols): Weight Loss Goal Gauge, Statistics 2x2, 7-Day Check-In, Block 2 & Block 3 -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Weight Loss Goal Semi-Circular Gauge Card -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-august-dark">Weight Goal Progress</h3>
                <p class="text-xs text-august-warmGray">
                  Started at {{ care.formatWeight(goal().startWeight) }} • Target {{ care.formatWeight(goal().goalWeight) }}
                </p>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">{{ goal().percent }}%</span>
            </div>

            <!-- Semi-Circular SVG Gauge -->
            <div class="flex flex-col items-center pt-1">
              <div class="relative w-56 h-32 flex items-end justify-center">
                <svg viewBox="0 0 180 105" class="w-full h-full overflow-visible" aria-hidden="true">
                  <!-- Background Arc -->
                  <path
                    d="M 20 90 A 70 70 0 0 1 160 90"
                    fill="none"
                    stroke="#ECE9DF"
                    stroke-width="14"
                    stroke-linecap="round"
                  />
                  <!-- Active Progress Arc (total length ~220) -->
                  <path
                    d="M 20 90 A 70 70 0 0 1 160 90"
                    fill="none"
                    [attr.stroke]="metrics().isConcerning ? '#E11D48' : '#5B4CE6'"
                    stroke-width="14"
                    stroke-linecap="round"
                    stroke-dasharray="220"
                    [attr.stroke-dashoffset]="goal().arcDashOffset"
                    class="transition-all duration-500"
                  />
                </svg>
                <div class="absolute bottom-2 text-center">
                  <div class="text-3xl font-serif font-bold text-august-dark leading-none">
                    {{ care.convertWeight(goal().currentWeight).toFixed(1) }}
                  </div>
                  <div class="text-[11px] font-semibold text-august-warmGray mt-1">
                    {{ care.convertWeight(goal().leftLbs).toFixed(1) }} {{ care.weightUnit() }} left to goal
                  </div>
                </div>
              </div>

              <div class="w-full flex justify-between text-[11px] font-bold text-august-warmGray px-4 pt-1">
                <span>Start: {{ care.formatWeight(goal().startWeight) }}</span>
                <span>Goal: {{ care.formatWeight(goal().goalWeight) }}</span>
              </div>
            </div>

            <div
              [class]="goal().onTrack
                ? 'p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-xs text-cyan-900 font-semibold flex items-center gap-2'
                : 'p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2'"
            >
              <app-icon [name]="goal().onTrack ? 'checkSeal' : 'alertSiren'" iconClass="w-4 h-4 shrink-0" />
              <span>
                {{ goal().onTrack
                  ? 'Good work! You have lost ' + care.formatWeight(goal().lostLbs) + ' and are on track.'
                  : 'Fluid gain alert active—check in with Dr. Miller before adjusting your goal.' }}
              </span>
            </div>
          </div>

          <!-- Statistics 2x2 Pastel Mini-Grid (Wake Sync, Sleep, Fluid Intake, Habits) -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-3.5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-august-dark">Daily Health Statistics</h3>
              <span class="text-[11px] text-august-warmGray font-medium">Habits &amp; Hydration</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-100 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Wake Up Sync</span>
                <div class="text-lg font-bold text-august-dark">{{ metrics().syncTime }}</div>
                <span class="text-[11px] text-emerald-800 block">Mattress Alarm</span>
              </div>

              <div class="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-100 space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-sky-700">Sleep Schedule</span>
                <div class="text-lg font-bold text-august-dark">{{ care.patient().sleepHours }} hr</div>
                <span class="text-[11px] text-sky-800 block">Restful Nocturnal</span>
              </div>

              <div class="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-100 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Fluid Intake</span>
                  <div class="flex gap-1">
                    <button type="button" (click)="care.adjustFluidIntake(-8)" class="w-5 h-5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">-</button>
                    <button type="button" (click)="care.adjustFluidIntake(8)" class="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">+</button>
                  </div>
                </div>
                <div class="text-lg font-bold text-august-dark">{{ care.patient().fluidIntakeOz }} / {{ care.patient().fluidLimitOz }} oz</div>
                <span class="text-[11px] text-indigo-800 block">Tap +/- 8 oz cup</span>
              </div>

              <div
                [class]="adherence().missedDiureticAlert
                  ? 'p-3.5 rounded-2xl bg-rose-50/95 border border-rose-200 space-y-1'
                  : 'p-3.5 rounded-2xl bg-orange-50/90 border border-orange-100 space-y-1'"
              >
                <div class="flex items-center justify-between gap-1">
                  <span [class]="adherence().missedDiureticAlert ? 'text-[10px] font-bold uppercase tracking-wider text-rose-700' : 'text-[10px] font-bold uppercase tracking-wider text-orange-700'">
                    Med Adherence
                  </span>
                  <span [class]="adherence().todayDiureticStatus === 'taken' ? 'text-[10px] font-bold text-emerald-700' : 'text-[10px] font-bold text-rose-700'">
                    {{ adherence().adherencePercent }}%
                  </span>
                </div>
                <div class="text-lg font-bold text-august-dark">{{ adherence().takenCount }} / {{ adherence().totalCount }} Taken</div>
                <span [class]="adherence().todayDiureticStatus === 'taken' ? 'text-[11px] text-emerald-800 font-semibold block' : 'text-[11px] text-rose-800 font-semibold block'">
                  {{ adherence().todayDiureticStatus === 'taken' ? 'Diuretics Complete' : 'Diuretic Dose Pending' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 7-Day Morning Health Check Tracker & Edit Card -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
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

            @if (selectedCheckInDay(); as sel) {
              <div class="p-3.5 rounded-2xl bg-august-ivory border border-august-border text-xs space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-august-dark">{{ sel.dateLabel }} ({{ sel.fullDate }})</span>
                  <span class="text-[11px] font-semibold text-august-warmGray">
                    Weight: <b class="text-august-dark">{{ care.formatWeight(sel.weight) }}</b>
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
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-august-border shadow-sm space-y-4">
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
        </div>
      </div>
    </div>

    <!-- Daily Medication Checklist Popup Modal -->
    @if (isMedChecklistOpen()) {
      <div
        class="fixed inset-0 bg-august-dark/55 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        (click)="isMedChecklistOpen.set(false)"
      >
        <div
          class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-august-border space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-august-sage text-august-forest flex items-center justify-center shrink-0">
                <app-icon name="pillDiuretic" iconClass="w-5 h-5 text-august-forest" />
              </div>
              <div>
                <h3 class="font-bold text-august-dark text-lg">Daily Medication Checklist</h3>
                <p class="text-xs text-august-warmGray">
                  {{ adherence().takenCount }} of {{ adherence().totalCount }} taken today • 7d diuretic rate {{ adherence().sevenDayRatePercent }}%
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="isMedChecklistOpen.set(false)"
              aria-label="Close medication checklist"
              class="w-8 h-8 rounded-full bg-august-ivory hover:bg-slate-200 text-august-dark font-bold text-sm flex items-center justify-center transition shrink-0"
            >
              ✕
            </button>
          </div>

          <div class="w-full h-2.5 rounded-full bg-august-ivory overflow-hidden border border-august-border/60">
            <div
              class="h-full rounded-full transition-all duration-300"
              [class]="adherence().missedDiureticAlert ? 'bg-rose-600' : 'bg-august-forest'"
              [style.width.%]="adherence().adherencePercent"
            ></div>
          </div>

          <div
            [class]="adherence().missedDiureticAlert
              ? 'p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-start gap-2'
              : adherence().todayDiureticStatus === 'taken'
                ? 'p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-start gap-2'
                : 'p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2'"
          >
            <app-icon [name]="adherence().missedDiureticAlert ? 'alertSiren' : 'checkSeal'" iconClass="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ adherence().correlationNote }}</span>
          </div>

          <div class="space-y-2.5">
            @for (med of care.patient().medications; track med.id) {
              <button
                type="button"
                (click)="care.toggleMedicationTaken(med.id)"
                [class]="med.takenToday
                  ? 'w-full text-left p-3.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 transition'
                  : 'w-full text-left p-3.5 bg-august-ivory hover:bg-white rounded-2xl border border-august-border flex items-center justify-between gap-3 transition'"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    [class]="med.takenToday
                      ? 'w-6 h-6 rounded-lg bg-august-forest text-white flex items-center justify-center shrink-0 text-xs font-bold'
                      : 'w-6 h-6 rounded-lg bg-white border-2 border-august-border text-transparent flex items-center justify-center shrink-0 text-xs font-bold'"
                  >
                    ✓
                  </span>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span [class]="med.takenToday ? 'font-bold text-august-dark text-sm line-through opacity-80' : 'font-bold text-august-dark text-sm'">
                        {{ med.name }}
                      </span>
                      <span
                        [class]="med.isDiuretic
                          ? 'px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase'
                          : 'px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-semibold uppercase'"
                      >
                        {{ med.isDiuretic ? 'Diuretic' : 'Daily Med' }}
                      </span>
                    </div>
                    <div class="text-xs text-august-warmGray truncate">
                      {{ med.dose }} • {{ med.frequency }}
                      @if (med.takenToday && med.takenAt) {
                        • <span class="text-emerald-700 font-semibold">Taken {{ med.takenAt }}</span>
                      }
                    </div>
                  </div>
                </div>
                <span
                  [class]="med.takenToday
                    ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-august-sage text-august-forest shrink-0'
                    : 'px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-august-border text-august-warmGray shrink-0'"
                >
                  {{ med.takenToday ? 'Taken' : 'Mark' }}
                </span>
              </button>
            } @empty {
              <div class="text-xs text-august-warmGray py-2">No medications listed. Add medications in Profile.</div>
            }
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-august-border">
            <a
              routerLink="/profile"
              (click)="isMedChecklistOpen.set(false)"
              class="text-xs font-bold text-august-forest hover:underline"
            >
              Edit Medications in Profile →
            </a>
            <div class="flex items-center gap-2">
              @if (adherence().takenCount < adherence().totalCount) {
                <button
                  type="button"
                  (click)="care.markAllMedicationsTaken()"
                  class="px-3.5 py-2 rounded-xl bg-august-forest hover:bg-august-forestHover text-white text-xs font-bold transition"
                >
                  Take All Remaining
                </button>
              }
              <button
                type="button"
                (click)="isMedChecklistOpen.set(false)"
                class="px-3.5 py-2 rounded-xl bg-august-ivory hover:bg-slate-200 border border-august-border text-xs font-bold text-august-dark transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Concerning Weight Alarm Modal -->
    @if (care.symptomGateCompleted() && metrics().isConcerning && !care.alertAcknowledged()) {
      <div class="fixed inset-0 bg-rose-950/65 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 space-y-5 animate-slide-up text-center">
          <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto relative">
            <app-icon name="alertSiren" iconClass="w-8 h-8" />
            <span class="w-3 h-3 rounded-full bg-rose-600 absolute -top-1 -right-1 alert-beacon"></span>
          </div>
          <div class="space-y-1.5">
            <span class="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">Clinical Fluid Alert</span>
            <h3 class="text-2xl font-serif font-medium text-august-dark pt-1">Concerning Weight Change Detected</h3>
            <p class="text-xs text-august-warmGray leading-relaxed">
              Your mattress scale measured <b class="text-august-dark">{{ care.formatWeight(metrics().latestWeight) }}</b> (<b class="text-rose-700">{{ maxDeltaFormatted() }}</b>), which exceeds your 2.0 lb safety limit. Your prescriber has been alerted.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2.5">
            <a
              routerLink="/chat"
              (click)="care.acknowledgeWeightAlert()"
              class="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
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
  readonly bmi = this.care.bmiInfo;
  readonly goal = this.care.goalProgress;
  readonly trends = this.care.trendStats;
  readonly adherence = this.care.adherenceSummary;

  readonly selectedCheckInId = signal<number>(7);
  readonly isMedChecklistOpen = signal<boolean>(false);

  readonly maxDeltaFormatted = computed(() =>
    this.formatUnitDelta(Math.max(this.metrics().overnightDelta, this.metrics().baselineDelta))
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

  readonly daysUntilNextVisit = computed(() => {
    const dateStr = this.care.patient().nextVisitDate;
    if (!dateStr) return 'Scheduled';
    const next = new Date(`${dateStr}T00:00:00`);
    const refToday = new Date('2026-11-24T00:00:00');
    const diffDays = Math.round((next.getTime() - refToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  });

  formatUnitDelta(deltaLbs: number): string {
    const val = this.care.convertWeight(deltaLbs);
    const fixed = val.toFixed(1);
    return `${val > 0 ? '+' : ''}${fixed} ${this.care.weightUnit()}`;
  }
}
