import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreathStatus } from '../../models/care.models';
import { CareStateService } from '../../services/care-state.service';
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
                <span class="text-xs font-semibold text-august-warmGray">3 quick questions</span>
              </div>
              <h2 class="text-2xl font-serif text-august-dark font-medium">How are you feeling today?</h2>
            </div>
            <div class="w-16 h-16 rounded-2xl bg-august-ivory border border-august-border p-1 shrink-0 shadow-xs overflow-hidden">
              <img src="mascot.jpg" alt="Care Mascot" class="w-full h-full object-contain rounded-xl" />
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
  private readonly care = inject(CareStateService);

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

    this.care.submitSymptoms({
      shortnessOfBreath: this.shortnessOfBreath(),
      poorAppetite: this.poorAppetite(),
      hasSwelling: this.hasSwelling(),
      swellingLocations: this.selectedLocations(),
      swellingOther: this.swellingOther.trim(),
      submittedAt: null
    });
  }
}
