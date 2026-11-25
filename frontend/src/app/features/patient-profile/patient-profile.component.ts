import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareStateService } from '../../core/services/care-state.service';
import { CustomIconComponent } from '../../shared/components/custom-icon/custom-icon.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [FormsModule, CustomIconComponent],
  template: `
    <div class="space-y-6">
      <form (ngSubmit)="saveProfile()" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-august-border shadow-sm">
          <div>
            <h2 class="text-2xl font-serif text-august-dark font-medium">Patient Profile &amp; Health Goals</h2>
            <p class="text-xs text-august-warmGray">Edit your age, height (for BMI), weight loss goal, baseline dry weight, and diuretics.</p>
          </div>
          <button
            type="submit"
            class="px-5 py-2.5 bg-august-forest hover:bg-august-forestHover text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <app-icon name="checkSeal" iconClass="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Info + Height + Live BMI Preview -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-august-border">
              <div class="flex items-center gap-2.5">
                <app-icon name="profile" iconClass="w-5 h-5 text-august-forest" />
                <h3 class="text-sm font-bold text-august-dark uppercase tracking-wider">Demographics &amp; Height</h3>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                BMI {{ care.bmiInfo().score.toFixed(1) }} ({{ care.bmiInfo().category }})
              </span>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Patient Name</label>
                <input [(ngModel)]="name" name="profName" type="text" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-august-warmGray font-bold mb-1">Date of Birth (Age {{ care.bmiInfo().ageYears }})</label>
                  <input [(ngModel)]="dob" name="profDob" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
                </div>
                <div>
                  <label class="block text-august-warmGray font-bold mb-1">Height (Feet / Inches)</label>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="relative">
                      <input [(ngModel)]="heightFeet" name="profFeet" type="number" min="3" max="7" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3 py-2.5 text-sm text-august-dark font-bold" />
                      <span class="absolute right-2.5 top-2.5 text-[11px] text-august-warmGray font-bold">ft</span>
                    </div>
                    <div class="relative">
                      <input [(ngModel)]="heightRemainderInches" name="profIn" type="number" min="0" max="11" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3 py-2.5 text-sm text-august-dark font-bold" />
                      <span class="absolute right-2.5 top-2.5 text-[11px] text-august-warmGray font-bold">in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weight Goals, Baseline & Last Visit -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center gap-2.5 pb-2 border-b border-august-border">
              <app-icon name="calendarVisit" iconClass="w-5 h-5 text-august-forest" />
              <h3 class="text-sm font-bold text-august-dark uppercase tracking-wider">Weight Goal, Baseline &amp; Visit</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Starting Weight ({{ care.weightUnit() }})</label>
                <input [(ngModel)]="startWeightInput" name="profStart" type="number" step="0.1" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-bold" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Target Dry Weight ({{ care.weightUnit() }})</label>
                <input [(ngModel)]="goalWeightInput" name="profGoal" type="number" step="0.1" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-indigo-700 font-bold" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Dry Baseline Weight ({{ care.weightUnit() }})</label>
                <input [(ngModel)]="baselineInput" name="profBase" type="number" step="0.1" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-bold" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Daily Fluid Limit (oz)</label>
                <input [(ngModel)]="fluidLimitOz" name="profFluid" type="number" min="16" max="128" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-bold" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Last Visit to Prescriber</label>
                <input [(ngModel)]="lastVisitDate" name="profVisit" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Next Follow-Up Visit</label>
                <input [(ngModel)]="nextVisitDate" name="profNextVisit" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-purple-800 font-medium" />
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Diuretics & Medications Card -->
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-august-border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <app-icon name="pillDiuretic" iconClass="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-august-dark">Diuretics &amp; Medications Taken</h3>
              <p class="text-xs text-august-warmGray">Check off daily doses or add new prescriptions</p>
            </div>
          </div>
          <button
            type="button"
            (click)="addDrawerOpen.set(true)"
            class="px-4 py-2 bg-august-ivory hover:bg-august-sage border border-august-border rounded-xl text-xs font-bold text-august-forest flex items-center gap-1.5 transition"
          >
            <app-icon name="plus" iconClass="w-4 h-4" />
            <span>Add Diuretic / Med</span>
          </button>
        </div>

        @if (addDrawerOpen()) {
          <form (ngSubmit)="submitNewMedication()" class="p-4 rounded-2xl bg-august-ivory border border-august-border space-y-3 animate-slide-up">
            <div class="text-xs font-bold text-august-forest uppercase tracking-wider">New Medication Entry</div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input [(ngModel)]="newMedName" name="medName" type="text" placeholder="Medication (e.g. Torsemide)" required class="bg-white border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
              <input [(ngModel)]="newMedDose" name="medDose" type="text" placeholder="Dosage (e.g. 20 mg)" required class="bg-white border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
              <input [(ngModel)]="newMedFreq" name="medFreq" type="text" placeholder="Schedule (e.g. Once daily)" class="bg-white border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label class="flex items-center gap-2 text-xs font-semibold text-august-dark cursor-pointer">
                <input [(ngModel)]="newMedDiuretic" name="medDiuretic" type="checkbox" class="rounded text-august-forest" />
                <span>This medication is a diuretic (water pill)</span>
              </label>
              <div class="flex gap-2">
                <button type="button" (click)="addDrawerOpen.set(false)" class="px-3.5 py-2 rounded-xl bg-white border border-august-border text-xs font-semibold text-august-warmGray">Cancel</button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-august-forest text-white text-xs font-bold">Add to List</button>
              </div>
            </div>
          </form>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (med of care.patient().medications; track med.id) {
            <div class="p-4 rounded-2xl bg-august-ivory border border-august-border flex flex-col justify-between gap-3">
              <div class="flex items-start justify-between gap-2">
                <div class="space-y-1">
                  <div class="font-bold text-august-dark text-sm flex flex-wrap items-center gap-1.5">
                    <span>{{ med.name }}</span>
                    @if (med.isDiuretic) {
                      <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">Diuretic</span>
                    }
                  </div>
                  <div class="text-xs text-august-warmGray">{{ med.dose }} • {{ med.frequency }}</div>
                </div>
                <button
                  type="button"
                  (click)="care.removeMedication(med.id)"
                  title="Remove medication"
                  class="text-august-warmGray hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition"
                >
                  <app-icon name="trash" iconClass="w-4 h-4" />
                </button>
              </div>
              <div class="pt-2 border-t border-august-border/70 flex items-center justify-between">
                <span class="text-[11px] text-august-warmGray">Today's Dose</span>
                <button
                  type="button"
                  (click)="care.toggleMedicationTaken(med.id)"
                  [class]="med.takenToday
                    ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-august-sage text-august-forest transition'
                    : 'px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-august-border text-august-warmGray hover:border-august-forest transition'"
                >
                  {{ med.takenToday ? '✓ Taken today' : 'Mark as taken' }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PatientProfileComponent {
  readonly care = inject(CareStateService);

  name = this.care.patient().name;
  dob = this.care.patient().dob;
  heightFeet = Math.floor(this.care.patient().heightInches / 12);
  heightRemainderInches = this.care.patient().heightInches % 12;
  startWeightInput = this.care.convertWeight(this.care.patient().startWeightLbs);
  goalWeightInput = this.care.convertWeight(this.care.patient().goalWeightLbs);
  baselineInput = this.care.convertWeight(this.care.patient().baselineWeight);
  fluidLimitOz = this.care.patient().fluidLimitOz;
  lastVisitDate = this.care.patient().lastVisitDate;
  nextVisitDate = this.care.patient().nextVisitDate;

  readonly addDrawerOpen = signal(false);
  newMedName = '';
  newMedDose = '';
  newMedFreq = 'Once daily • Morning';
  newMedDiuretic = true;

  constructor() {
    effect(() => {
      const p = this.care.patient();
      this.care.weightUnit();
      this.name = p.name;
      this.dob = p.dob;
      this.heightFeet = Math.floor(p.heightInches / 12);
      this.heightRemainderInches = p.heightInches % 12;
      this.startWeightInput = this.care.convertWeight(p.startWeightLbs);
      this.goalWeightInput = this.care.convertWeight(p.goalWeightLbs);
      this.baselineInput = this.care.convertWeight(p.baselineWeight);
      this.fluidLimitOz = p.fluidLimitOz;
      this.lastVisitDate = p.lastVisitDate;
      this.nextVisitDate = p.nextVisitDate;
    });
  }

  saveProfile(): void {
    const base = this.care.toLbs(Number(this.baselineInput));
    const start = this.care.toLbs(Number(this.startWeightInput));
    const goal = this.care.toLbs(Number(this.goalWeightInput));
    const totalInches = Number(this.heightFeet) * 12 + Number(this.heightRemainderInches);

    if (
      !this.name.trim() ||
      Number.isNaN(base) ||
      base < 50 ||
      base > 500 ||
      Number.isNaN(start) ||
      start < 50 ||
      start > 500 ||
      Number.isNaN(goal) ||
      goal < 50 ||
      goal > 500 ||
      totalInches < 48 ||
      totalInches > 96
    ) {
      this.care.showToast('Please enter a valid name, height (4–8 ft), and weights (50–500 lbs).', 'alert');
      return;
    }

    if (goal > start) {
      this.care.showToast('Target weight cannot exceed starting weight.', 'alert');
      return;
    }

    this.care.updateProfile({
      name: this.name.trim(),
      dob: this.dob,
      heightInches: totalInches,
      startWeightLbs: Number(start.toFixed(1)),
      goalWeightLbs: Number(goal.toFixed(1)),
      baselineWeight: Number(base.toFixed(1)),
      fluidLimitOz: Math.max(16, Math.min(128, Number(this.fluidLimitOz) || 50)),
      lastVisitDate: this.lastVisitDate,
      nextVisitDate: this.nextVisitDate
    });
  }

  submitNewMedication(): void {
    if (!this.newMedName.trim() || !this.newMedDose.trim()) {
      this.care.showToast('Please enter medication name and dosage.', 'alert');
      return;
    }
    this.care.addMedication({
      name: this.newMedName.trim(),
      dose: this.newMedDose.trim(),
      frequency: this.newMedFreq.trim() || 'Once daily',
      isDiuretic: this.newMedDiuretic
    });
    this.newMedName = '';
    this.newMedDose = '';
    this.addDrawerOpen.set(false);
  }
}
