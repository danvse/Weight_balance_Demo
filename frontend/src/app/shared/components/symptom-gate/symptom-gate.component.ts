import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreathStatus, VitalSigns } from '../../../core/models/care.models';
import { CareStateService } from '../../../core/services/care-state.service';
import { CustomIconComponent, CustomIconName } from '../custom-icon/custom-icon.component';

interface BodyRegionOption {
  label: string;
  icon: CustomIconName;
}

@Component({
  selector: 'app-symptom-gate',
  standalone: true,
  imports: [FormsModule, CustomIconComponent],
  template: `
    <div class="fixed inset-0 bg-august-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl border border-august-border space-y-5 animate-slide-up max-h-[92vh] overflow-y-auto custom-scroll">
        <div class="space-y-1.5 border-b border-august-border pb-4">
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-august-sage text-august-forest font-bold text-[11px] uppercase tracking-wider">
                  <app-icon name="mattressScale" iconClass="w-3.5 h-3.5" />
                  <span>Morning Health Check</span>
                </span>
                <span class="text-xs font-semibold text-august-warmGray">3 questions + Vitals</span>
              </div>
              <h2 class="text-2xl font-serif text-august-dark font-medium">How are you feeling today?</h2>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-16 h-16 rounded-2xl bg-august-ivory border border-august-border p-1 shadow-xs overflow-hidden">
                <img src="media/images/mascot.jpg" alt="Care Mascot" class="w-full h-full object-contain rounded-xl" />
              </div>
              @if (care.canDismissSymptomGate()) {
                <button
                  type="button"
                  (click)="care.closeSymptomGateEditor()"
                  aria-label="Cancel editing morning check"
                  class="w-9 h-9 rounded-full bg-august-ivory hover:bg-slate-200 border border-august-border text-august-dark font-bold text-sm flex items-center justify-center transition"
                >
                  ✕
                </button>
              }
            </div>
          </div>
          <p class="text-xs text-august-warmGray leading-relaxed">
            Your mattress scale logged your morning weight. Please answer these questions before viewing your dashboard.
          </p>
        </div>

        <!-- Question 1: Shortness of Breath -->
        <div class="bg-august-ivory p-4 rounded-2xl border border-august-border space-y-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-august-sage text-august-forest flex items-center justify-center">
              <app-icon name="lungs" iconClass="w-5 h-5" />
            </div>
            <label class="text-xs sm:text-sm font-bold text-august-dark">1. Have you had shortness of breath?</label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            @for (opt of breathOptions; track opt.value) {
              <button
                type="button"
                (click)="shortnessOfBreath.set(opt.value)"
                [class]="shortnessOfBreath() === opt.value
                  ? 'flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-august-forest bg-august-forest text-white shadow-sm font-bold transition'
                  : 'flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-august-border bg-white text-august-dark hover:border-august-forest/60 font-bold transition'"
              >
                <span>{{ opt.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Question 2: Poor Appetite -->
        <div class="bg-august-ivory p-4 rounded-2xl border border-august-border space-y-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <app-icon name="appetite" iconClass="w-5 h-5" />
            </div>
            <label class="text-xs sm:text-sm font-bold text-august-dark">2. Do you have poor appetite?</label>
          </div>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              (click)="poorAppetite.set(false)"
              [class]="!poorAppetite()
                ? 'flex items-center justify-center p-3.5 rounded-2xl border border-august-forest bg-august-forest text-white shadow-sm font-bold transition'
                : 'flex items-center justify-center p-3.5 rounded-2xl border border-august-border bg-white text-august-dark hover:border-august-forest/60 font-bold transition'"
            >
              No, eating normally
            </button>
            <button
              type="button"
              (click)="poorAppetite.set(true)"
              [class]="poorAppetite()
                ? 'flex items-center justify-center p-3.5 rounded-2xl border border-august-forest bg-august-forest text-white shadow-sm font-bold transition'
                : 'flex items-center justify-center p-3.5 rounded-2xl border border-august-border bg-white text-august-dark hover:border-august-forest/60 font-bold transition'"
            >
              Yes, poor appetite
            </button>
          </div>
        </div>

        <!-- Question 3: Swelling + Where -->
        <div class="bg-august-ivory p-4 rounded-2xl border border-august-border space-y-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <app-icon name="edema" iconClass="w-5 h-5" />
            </div>
            <label class="text-xs sm:text-sm font-bold text-august-dark">3. Do you have any swelling anywhere?</label>
          </div>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              (click)="setSwelling(false)"
              [class]="!hasSwelling()
                ? 'flex items-center justify-center p-3.5 rounded-2xl border border-august-forest bg-august-forest text-white shadow-sm font-bold transition'
                : 'flex items-center justify-center p-3.5 rounded-2xl border border-august-border bg-white text-august-dark hover:border-august-forest/60 font-bold transition'"
            >
              No swelling
            </button>
            <button
              type="button"
              (click)="setSwelling(true)"
              [class]="hasSwelling()
                ? 'flex items-center justify-center p-3.5 rounded-2xl border border-august-forest bg-august-forest text-white shadow-sm font-bold transition'
                : 'flex items-center justify-center p-3.5 rounded-2xl border border-august-border bg-white text-august-dark hover:border-august-forest/60 font-bold transition'"
            >
              Yes, I have swelling
            </button>
          </div>

          @if (hasSwelling()) {
            <div class="pt-3 border-t border-august-border space-y-2.5">
              <p class="text-xs font-bold text-august-dark">If so, where is the swelling? (Tap all that apply)</p>
              <div class="grid grid-cols-2 gap-2">
                @for (region of bodyRegions; track region.label) {
                  <button
                    type="button"
                    (click)="toggleLocation(region.label)"
                    [class]="selectedLocations().includes(region.label)
                      ? 'flex items-center gap-2.5 p-3 rounded-xl border border-august-forest bg-august-sage text-august-forest shadow-xs text-xs font-semibold text-left transition'
                      : 'flex items-center gap-2.5 p-3 rounded-xl border border-august-border bg-white text-august-dark hover:border-august-forest/50 text-xs font-semibold text-left transition'"
                  >
                    <app-icon [name]="region.icon" iconClass="w-5 h-5 shrink-0" />
                    <span>{{ region.label }}</span>
                  </button>
                }
              </div>
              <input
                [(ngModel)]="swellingOther"
                type="text"
                placeholder="Other location (optional, e.g. lower back)..."
                class="w-full bg-white border border-august-border rounded-xl px-3.5 py-2 text-xs text-august-dark"
              />
            </div>
          }
        </div>

        <!-- Question 4: Morning Vitals (BP, Heart Rate & SpO2) -->
        <div class="bg-august-ivory p-4 rounded-2xl border border-august-border space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <app-icon name="stethoscope" iconClass="w-5 h-5" />
              </div>
              <div>
                <label class="text-xs sm:text-sm font-bold text-august-dark block">4. Morning Vitals (BP, Heart Rate &amp; SpO₂)</label>
                <span class="text-[11px] text-august-warmGray">Optional — enter manually or sync cuff/pulse oximeter</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="syncBluetoothVitals()"
                class="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
              >
                <app-icon name="sync" iconClass="w-3.5 h-3.5" />
                <span>Sync Cuff &amp; SpO₂</span>
              </button>
              <button
                type="button"
                (click)="includeVitals.set(!includeVitals())"
                class="px-2.5 py-1.5 rounded-xl bg-white border border-august-border text-[11px] font-semibold text-august-warmGray hover:text-august-dark transition"
              >
                {{ includeVitals() ? 'Skip' : 'Add Vitals' }}
              </button>
            </div>
          </div>

          @if (includeVitals()) {
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="bg-white p-2.5 rounded-xl border border-august-border">
                <label class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Systolic (mmHg)</label>
                <input
                  [(ngModel)]="systolicBp"
                  type="number"
                  min="60"
                  max="250"
                  class="w-full mt-1 text-sm font-bold text-august-dark focus:outline-none"
                />
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-august-border">
                <label class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Diastolic (mmHg)</label>
                <input
                  [(ngModel)]="diastolicBp"
                  type="number"
                  min="35"
                  max="150"
                  class="w-full mt-1 text-sm font-bold text-august-dark focus:outline-none"
                />
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-august-border">
                <label class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">Heart Rate (bpm)</label>
                <input
                  [(ngModel)]="heartRate"
                  type="number"
                  min="30"
                  max="200"
                  class="w-full mt-1 text-sm font-bold text-august-dark focus:outline-none"
                />
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-august-border">
                <label class="text-[10px] font-bold uppercase tracking-wider text-august-warmGray block">SpO₂ (%)</label>
                <input
                  [(ngModel)]="spo2"
                  type="number"
                  min="70"
                  max="100"
                  class="w-full mt-1 text-sm font-bold text-august-dark focus:outline-none"
                />
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px]">
              <span class="text-august-warmGray">
                Source: <b class="text-august-dark">{{ vitalsSource() === 'bluetooth' ? 'Bluetooth Cuff + Pulse Ox' : 'Manual Entry' }}</b>
              </span>
              @if (previewVitalAlert()) {
                <span class="font-bold text-red-700">{{ previewVitalAlert() }}</span>
              } @else {
                <span class="font-semibold text-emerald-700">Within target range</span>
              }
            </div>
          }
        </div>

        <button
          type="button"
          (click)="submit()"
          class="w-full py-4 bg-august-forest hover:bg-august-forestHover text-white font-bold rounded-2xl shadow-lg shadow-august-forest/25 text-sm flex items-center justify-center gap-2 transition"
        >
          <span>Submit &amp; Access Dashboard</span>
          <app-icon name="arrowRight" iconClass="w-4 h-4" />
        </button>
      </div>
    </div>
  `
})
export class SymptomGateComponent {
  readonly care = inject(CareStateService);

  readonly breathOptions: { value: BreathStatus; label: string }[] = [
    { value: 'none', label: 'No, breathing normal' },
    { value: 'mild', label: 'Yes, with activity' },
    { value: 'rest', label: 'Yes, even at rest' }
  ];

  readonly bodyRegions: BodyRegionOption[] = [
    { label: 'Feet & Ankles', icon: 'bodyFoot' },
    { label: 'Lower Legs', icon: 'bodyLeg' },
    { label: 'Abdomen / Belly', icon: 'bodyAbdomen' },
    { label: 'Hands & Face', icon: 'bodyHand' }
  ];

  readonly shortnessOfBreath = signal<BreathStatus>(this.care.todaySymptoms().shortnessOfBreath);
  readonly poorAppetite = signal<boolean>(this.care.todaySymptoms().poorAppetite);
  readonly hasSwelling = signal<boolean>(this.care.todaySymptoms().hasSwelling);
  readonly selectedLocations = signal<string[]>([...this.care.todaySymptoms().swellingLocations]);
  swellingOther = this.care.todaySymptoms().swellingOther;

  readonly includeVitals = signal<boolean>(true);
  readonly vitalsSource = signal<'manual' | 'bluetooth'>(this.care.todaySymptoms().vitals?.source ?? 'bluetooth');
  systolicBp: number | null = this.care.todaySymptoms().vitals?.systolicBp ?? 118;
  diastolicBp: number | null = this.care.todaySymptoms().vitals?.diastolicBp ?? 74;
  heartRate: number | null = this.care.todaySymptoms().vitals?.heartRate ?? 72;
  spo2: number | null = this.care.todaySymptoms().vitals?.spo2 ?? 97;

  previewVitalAlert(): string | null {
    const reasons: string[] = [];
    if (this.systolicBp != null && this.diastolicBp != null && (this.systolicBp < 95 || this.diastolicBp < 60)) {
      reasons.push('Low BP (<95/60)');
    }
    if (this.systolicBp != null && this.diastolicBp != null && (this.systolicBp >= 160 || this.diastolicBp >= 100)) {
      reasons.push('High BP (>=160/100)');
    }
    if (this.spo2 != null && this.spo2 < 92) {
      reasons.push(`Low SpO₂ (${this.spo2}%)`);
    }
    if (this.heartRate != null && (this.heartRate < 50 || this.heartRate > 110)) {
      reasons.push(`HR ${this.heartRate} bpm`);
    }
    return reasons.length ? `Alert: ${reasons.join(' • ')}` : null;
  }

  syncBluetoothVitals(): void {
    this.includeVitals.set(true);
    this.vitalsSource.set('bluetooth');
    this.systolicBp = 118;
    this.diastolicBp = 74;
    this.heartRate = 72;
    this.spo2 = 97;
    this.care.showToast('Synced morning cuff (118/74 mmHg, HR 72) & pulse ox (SpO₂ 97%).', 'success');
  }

  setSwelling(val: boolean): void {
    this.hasSwelling.set(val);
    if (!val) {
      this.selectedLocations.set([]);
      this.swellingOther = '';
    }
  }

  toggleLocation(loc: string): void {
    this.selectedLocations.update(list =>
      list.includes(loc) ? list.filter(x => x !== loc) : [...list, loc]
    );
  }

  submit(): void {
    if (this.hasSwelling() && this.selectedLocations().length === 0 && !this.swellingOther.trim()) {
      this.care.showToast('Please select or type where you notice swelling.', 'alert');
      return;
    }

    const vitals: VitalSigns | undefined = this.includeVitals()
      ? {
          systolicBp: this.systolicBp !== null ? Number(this.systolicBp) : null,
          diastolicBp: this.diastolicBp !== null ? Number(this.diastolicBp) : null,
          heartRate: this.heartRate !== null ? Number(this.heartRate) : null,
          spo2: this.spo2 !== null ? Number(this.spo2) : null,
          source: this.vitalsSource()
        }
      : undefined;

    this.care.submitSymptoms({
      shortnessOfBreath: this.shortnessOfBreath(),
      poorAppetite: this.poorAppetite(),
      hasSwelling: this.hasSwelling(),
      swellingLocations: this.selectedLocations(),
      swellingOther: this.swellingOther.trim(),
      vitals,
      submittedAt: null
    });
  }
}
