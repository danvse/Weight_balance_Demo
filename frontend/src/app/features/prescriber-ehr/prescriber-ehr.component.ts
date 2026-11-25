import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CareStateService } from '../../core/services/care-state.service';
import { CustomIconComponent } from '../../shared/components/custom-icon/custom-icon.component';

@Component({
  selector: 'app-prescriber-ehr',
  standalone: true,
  imports: [FormsModule, CustomIconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-august-border shadow-sm">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-emerald-800">Prescriber Triage EHR</span>
          <h1 class="text-3xl font-serif text-august-dark font-medium pt-1">{{ care.patient().prescriberName }}</h1>
          <p class="text-xs text-august-warmGray">{{ care.patient().prescriberSpecialty }} • Live Mattress Telemetry &amp; Symptom Triage</p>
        </div>
        <button
          type="button"
          (click)="inspectPatient('/home')"
          class="px-4 py-2.5 rounded-xl bg-august-forest hover:bg-august-forestHover text-white text-xs font-bold transition"
        >
          Switch to Patient View
        </button>
      </div>

      <!-- Triage Table -->
      <div class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-base font-bold text-august-dark">Monitored Patient Roster</h2>
            <p class="text-xs text-august-warmGray">Automatically flags patients with &gt;2.0 lb weight changes or acute symptoms</p>
          </div>
          <span
            [class]="metrics().isConcerning || vitals().isConcerning
              ? 'px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
              : 'px-3 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs'"
          >
            {{ metrics().isConcerning || vitals().isConcerning ? '1 Critical Alert (Weight / Vitals)' : '0 Critical Alerts' }}
          </span>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-august-border">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-august-ivory font-bold uppercase tracking-wider text-august-warmGray border-b border-august-border">
              <tr>
                <th class="py-3 px-4">Patient</th>
                <th class="py-3 px-3">Mattress Weight</th>
                <th class="py-3 px-3">Overnight Change</th>
                <th class="py-3 px-3">Today's Symptoms</th>
                <th class="py-3 px-3">Primary Diuretic &amp; Adherence</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-august-border font-medium text-august-dark">
              <tr [class]="metrics().isConcerning ? 'bg-red-50/80 hover:bg-red-50 transition' : 'hover:bg-august-ivory/60 transition'">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-sm text-august-dark">{{ care.patient().name }}</div>
                  <span class="text-[11px] text-august-warmGray">Sensor: {{ care.patient().serialNumber }}</span>
                </td>
                <td class="py-3.5 px-3 font-serif font-bold text-base">{{ care.formatWeight(metrics().latestWeight) }}</td>
                <td class="py-3.5 px-3">
                  <span
                    [class]="metrics().isConcerning
                      ? 'px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
                      : 'px-2.5 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs'"
                  >
                    {{ care.formatUnitDelta(metrics().overnightDelta) }} {{ metrics().isConcerning ? '(High > ' + care.formatWeight(2.0) + ')' : '(Stable)' }}
                  </span>
                </td>
                <td [class]="hasSymFlag() ? 'py-3.5 px-3 text-red-700 font-semibold' : 'py-3.5 px-3 text-august-warmGray'">
                  <div>{{ care.symptomSummary() }}</div>
                  @if (vitals().hasReading) {
                    <span
                      [class]="vitals().isConcerning
                        ? 'inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]'
                        : 'inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-semibold text-[10px]'"
                    >
                      {{ vitals().summaryLabel }}
                    </span>
                  }
                </td>
                <td class="py-3.5 px-3">
                  <div class="font-bold text-august-dark">{{ primaryDiuretic() }}</div>
                  <span
                    [class]="adherence().missedDiureticAlert
                      ? 'inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]'
                      : adherence().todayDiureticStatus === 'taken'
                        ? 'inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]'
                        : 'inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]'"
                  >
                    {{ adherence().diureticTakenCount }}/{{ adherence().diureticTotalCount }} today • 7d: {{ adherence().sevenDayRatePercent }}%
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button type="button" (click)="inspectPatient('/home')" class="px-3 py-1.5 bg-august-forest text-white rounded-lg font-bold text-xs">Inspect Chart</button>
                    <button type="button" (click)="inspectPatient('/chat')" class="px-3 py-1.5 bg-white border border-august-border text-august-dark rounded-lg font-bold text-xs">Open Chat</button>
                  </div>
                </td>
              </tr>
              <tr class="hover:bg-august-ivory/50">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-sm text-august-dark">Martha Jenkins</div>
                  <span class="text-[11px] text-august-warmGray">68 F • Post-MI</span>
                </td>
                <td class="py-3.5 px-3 font-serif font-bold text-base">{{ care.formatWeight(142.1) }}</td>
                <td class="py-3.5 px-3"><span class="px-2.5 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs">{{ care.formatUnitDelta(-0.1) }} (Stable)</span></td>
                <td class="py-3.5 px-3 text-august-warmGray">
                  <div>No SOB • Normal appetite • No swelling</div>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-semibold text-[10px]">BP 122/76 • HR 68 • SpO₂ 98%</span>
                </td>
                <td class="py-3.5 px-3">Torsemide 20 mg</td>
                <td class="py-3.5 px-4 text-right text-august-warmGray">Routine monitoring</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Diuretic Adherence & Weight Correlation Panel -->
      <div class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <app-icon name="pillDiuretic" iconClass="w-5 h-5 text-august-forest" />
            <div>
              <h3 class="text-base font-bold text-august-dark">Medication Dose Checklist &amp; Fluid Correlation ({{ care.patient().name }})</h3>
              <p class="text-xs text-august-warmGray">Syncs live with patient's home dose check-offs to distinguish non-adherence from worsening retention</p>
            </div>
          </div>
          <span
            [class]="adherence().missedDiureticAlert
              ? 'px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs'
              : 'px-3 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs'"
          >
            {{ adherence().takenCount }} / {{ adherence().totalCount }} doses taken today ({{ adherence().sevenDayRatePercent }}% 7d diuretic rate)
          </span>
        </div>

        <div
          [class]="adherence().missedDiureticAlert
            ? 'p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2'
            : 'p-3.5 rounded-2xl bg-august-ivory border border-august-border text-xs text-august-dark font-medium flex items-center gap-2'"
        >
          <app-icon [name]="adherence().missedDiureticAlert ? 'alertSiren' : 'checkSeal'" iconClass="w-4 h-4 shrink-0" />
          <span>{{ adherence().correlationNote }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (med of care.patient().medications; track med.id) {
            <div
              [class]="med.takenToday
                ? 'p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1'
                : 'p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1'"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-xs text-august-dark">{{ med.name }}</span>
                <span
                  [class]="med.takenToday
                    ? 'px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold'
                    : 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold'"
                >
                  {{ med.takenToday ? 'Taken' : 'Pending' }}
                </span>
              </div>
              <div class="text-[11px] text-august-warmGray">{{ med.dose }} • {{ med.isDiuretic ? 'Diuretic' : 'Cardio Med' }}</div>
              <div class="text-[10px] font-semibold text-august-dark">
                {{ med.takenToday && med.takenAt ? 'Checked off at ' + med.takenAt : 'Not yet marked today' }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Push Live Care Update to Patient Home Dashboard -->
      <form (ngSubmit)="publishNote()" class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-3">
        <div class="flex items-center gap-2.5">
          <app-icon name="stethoscope" iconClass="w-5 h-5 text-august-forest" />
          <h3 class="text-base font-bold text-august-dark">Send Live Update to Patient's Home Dashboard</h3>
        </div>
        <p class="text-xs text-august-warmGray">
          Anything you post here immediately updates the "Updates from Prescriber" block on the patient's main page and notifies their chat.
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            [(ngModel)]="noteDraft"
            name="prescriberNote"
            type="text"
            placeholder="e.g. Take an extra 20 mg Furosemide today and re-check weight tomorrow morning."
            class="flex-1 bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-august-dark"
          />
          <button
            type="submit"
            class="px-5 py-2.5 bg-august-forest hover:bg-august-forestHover text-white font-bold text-xs sm:text-sm rounded-xl transition shrink-0"
          >
            Publish Care Update
          </button>
        </div>
      </form>
    </div>
  `
})
export class PrescriberEhrComponent {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);
  readonly metrics = this.care.clinicalMetrics;
  readonly adherence = this.care.adherenceSummary;
  readonly vitals = this.care.vitalsStatus;

  noteDraft = '';

  readonly primaryDiuretic = computed(() => {
    const found = this.care.patient().medications.find(m => m.isDiuretic);
    return found ? `${found.name} ${found.dose}` : 'None active';
  });

  readonly hasSymFlag = computed(() => {
    const s = this.care.todaySymptoms();
    return s.shortnessOfBreath !== 'none' || s.hasSwelling || this.metrics().isConcerning || this.vitals().isConcerning;
  });

  inspectPatient(route: string): void {
    this.router.navigateByUrl(route).then(ok => {
      if (ok) this.care.switchRole('patient');
    });
  }

  publishNote(): void {
    this.care.publishPrescriberUpdate(this.noteDraft);
    this.noteDraft = '';
  }
}
