import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareStateService } from '../../services/care-state.service';
import { CustomIconComponent } from '../custom-icon/custom-icon.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [FormsModule, CustomIconComponent],
  template: `
    <div class="space-y-6">
      <form (ngSubmit)="saveProfile()" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-august-border shadow-sm">
          <div>
            <h2 class="text-2xl font-serif text-august-dark font-medium">Patient Profile &amp; Medications</h2>
            <p class="text-xs text-august-warmGray">Edit your personal details, baseline dry weight, last prescriber visit, and diuretics.</p>
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
          <!-- Basic Info -->
          <div class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center gap-2.5 pb-2 border-b border-august-border">
              <app-icon name="profile" iconClass="w-5 h-5 text-august-forest" />
              <h3 class="text-sm font-bold text-august-dark uppercase tracking-wider">Basic Information</h3>
            </div>
            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Patient Name</label>
                <input [(ngModel)]="name" name="profName" type="text" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Date of Birth / Reference Date</label>
                <input [(ngModel)]="dob" name="profDob" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
              </div>
            </div>
          </div>

          <!-- Baseline & Last Visit -->
          <div class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
            <div class="flex items-center gap-2.5 pb-2 border-b border-august-border">
              <app-icon name="calendarVisit" iconClass="w-5 h-5 text-august-forest" />
              <h3 class="text-sm font-bold text-august-dark uppercase tracking-wider">Baseline &amp; Prescriber Visit</h3>
            </div>
            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Baseline Weight (lbs)</label>
                <input [(ngModel)]="baselineWeight" name="profBase" type="number" step="0.1" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-base text-august-dark font-bold" />
                <span class="text-[11px] text-august-warmGray block mt-1">Gains &gt;2.0 lbs above baseline trigger the red alert dashboard.</span>
              </div>
              <div>
                <label class="block text-august-warmGray font-bold mb-1">Last Visit to Prescriber</label>
                <input [(ngModel)]="lastVisitDate" name="profVisit" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-sm text-august-dark font-medium" />
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Diuretics & Medications Card -->
      <div class="bg-white rounded-3xl p-6 border border-august-border shadow-sm space-y-4">
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
  baselineWeight = this.care.patient().baselineWeight;
  lastVisitDate = this.care.patient().lastVisitDate;

  readonly addDrawerOpen = signal(false);
  newMedName = '';
  newMedDose = '';
  newMedFreq = 'Once daily • Morning';
  newMedDiuretic = true;

  saveProfile(): void {
    const base = Number(this.baselineWeight);
    if (!this.name.trim() || Number.isNaN(base) || base < 50 || base > 500) {
      this.care.showToast('Please enter a valid name and baseline weight.', 'alert');
      return;
    }
    this.care.updateProfile({
      name: this.name.trim(),
      dob: this.dob,
      baselineWeight: Number(base.toFixed(1)),
      lastVisitDate: this.lastVisitDate
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
