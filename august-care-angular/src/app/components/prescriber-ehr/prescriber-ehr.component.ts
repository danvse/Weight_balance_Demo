import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CareStateService } from '../../services/care-state.service';
import { CustomIconComponent } from '../custom-icon/custom-icon.component';

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
            [class]="metrics().isConcerning
              ? 'px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
              : 'px-3 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs'"
          >
            {{ metrics().isConcerning ? '1 Critical Alert (>2 lbs)' : '0 Critical Alerts' }}
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
                <th class="py-3 px-3">Primary Diuretic</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-august-border font-medium text-august-dark">
              <tr [class]="metrics().isConcerning ? 'bg-red-50/80 hover:bg-red-50 transition' : 'hover:bg-august-ivory/60 transition'">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-sm text-august-dark">{{ care.patient().name }}</div>
                  <span class="text-[11px] text-august-warmGray">Sensor: {{ care.patient().serialNumber }}</span>
                </td>
                <td class="py-3.5 px-3 font-serif font-bold text-base">{{ metrics().latestWeight.toFixed(1) }} lbs</td>
                <td class="py-3.5 px-3">
                  <span
                    [class]="metrics().isConcerning
                      ? 'px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
                      : 'px-2.5 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs'"
                  >
                    {{ care.formatDelta(metrics().overnightDelta) }} {{ metrics().isConcerning ? '(High >2 lbs)' : '(Stable)' }}
                  </span>
                </td>
                <td [class]="hasSymFlag() ? 'py-3.5 px-3 text-red-700 font-semibold' : 'py-3.5 px-3 text-august-warmGray'">
                  {{ care.symptomSummary() }}
                </td>
                <td class="py-3.5 px-3">{{ primaryDiuretic() }}</td>
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
                <td class="py-3.5 px-3 font-serif font-bold text-base">142.1 lbs</td>
                <td class="py-3.5 px-3"><span class="px-2.5 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs">-0.1 lbs (Stable)</span></td>
                <td class="py-3.5 px-3 text-august-warmGray">No SOB • Normal appetite • No swelling</td>
                <td class="py-3.5 px-3">Torsemide 20 mg</td>
                <td class="py-3.5 px-4 text-right text-august-warmGray">Routine monitoring</td>
              </tr>
            </tbody>
          </table>
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

  noteDraft = '';

  readonly primaryDiuretic = computed(() => {
    const found = this.care.patient().medications.find(m => m.isDiuretic);
    return found ? `${found.name} ${found.dose}` : 'None active';
  });

  readonly hasSymFlag = computed(() => {
    const s = this.care.todaySymptoms();
    return s.shortnessOfBreath !== 'none' || s.hasSwelling || this.metrics().isConcerning;
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
