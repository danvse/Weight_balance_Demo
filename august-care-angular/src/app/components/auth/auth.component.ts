import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRole } from '../../models/care.models';
import { CareStateService } from '../../services/care-state.service';
import { CustomIconComponent } from '../custom-icon/custom-icon.component';
import { HospitalBgComponent } from '../hospital-bg/hospital-bg.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CustomIconComponent, HospitalBgComponent],
  template: `
    <section class="fixed inset-0 z-50 bg-[#F3F0E8] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <app-hospital-bg
        [videoSrc]="selectedAuthRole() === 'prescriber' ? 'clinic-bg.mp4' : 'atrium-bg.mp4'"
        scrimClass="fixed inset-0 bg-[#F3F0E8]/35 pointer-events-none z-0"
      />

      <div class="relative z-10 max-w-lg w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-august-border overflow-hidden animate-slide-up p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <!-- Compact Brand Header with Mascot -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-august-forest text-white flex items-center justify-center shadow-xs">
                <app-icon name="brandLogo" iconClass="w-6 h-6" />
              </div>
              <div>
                <span class="text-lg font-serif font-bold text-august-dark tracking-tight block leading-none">August Care</span>
                <span class="text-[10px] uppercase tracking-widest text-august-warmGray font-bold">Mattress Scale RPM</span>
              </div>
            </div>
            <div class="w-11 h-11 rounded-2xl bg-august-ivory border border-august-border p-1 overflow-hidden shadow-xs" title="Your Care Mascot">
              <img src="mascot.jpg" alt="August Care Mascot" class="w-full h-full object-contain rounded-xl" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between border-b border-august-border pb-3.5 mb-6">
              <div>
                <button
                  type="button"
                  (click)="activeTab.set('login')"
                  [class]="activeTab() === 'login'
                    ? 'pb-2.5 border-b-2 border-august-forest text-august-forest font-bold text-sm transition'
                    : 'pb-2.5 border-b-2 border-transparent text-august-warmGray hover:text-august-dark font-medium text-sm transition'"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  (click)="activeTab.set('signup')"
                  [class]="activeTab() === 'signup'
                    ? 'pb-2.5 border-b-2 border-august-forest text-august-forest font-bold text-sm transition ml-5'
                    : 'pb-2.5 border-b-2 border-transparent text-august-warmGray hover:text-august-dark font-medium text-sm transition ml-5'"
                >
                  Sign Up
                </button>
              </div>
              <span class="text-[11px] text-august-warmGray font-medium hidden sm:inline">Patient &amp; Prescriber Access</span>
            </div>

            @if (activeTab() === 'login') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-2xl font-serif font-medium text-august-dark">Sign in to your care portal</h2>
                  <p class="text-xs text-august-warmGray mt-0.5">Choose your role to open the patient dashboard or prescriber EHR.</p>
                </div>

                <div class="grid grid-cols-2 gap-2 p-1 bg-august-ivory rounded-2xl border border-august-border text-xs">
                  <button
                    type="button"
                    (click)="selectLoginRole('patient')"
                    [class]="loginRole() === 'patient'
                      ? 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition'
                      : 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition'"
                  >
                    <app-icon name="profile" iconClass="w-4 h-4" />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    (click)="selectLoginRole('prescriber')"
                    [class]="loginRole() === 'prescriber'
                      ? 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition'
                      : 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition'"
                  >
                    <app-icon name="stethoscope" iconClass="w-4 h-4" />
                    <span>Prescriber / MD</span>
                  </button>
                </div>

                <form (ngSubmit)="submitLogin()" class="space-y-3.5 pt-1">
                  <div>
                    <label class="block text-xs font-bold text-august-dark mb-1">Email Address</label>
                    <input
                      [(ngModel)]="loginEmail"
                      name="loginEmail"
                      type="email"
                      required
                      class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-august-dark"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-xs font-bold text-august-dark">Password</label>
                      <button
                        type="button"
                        (click)="care.showToast('Demo mode: use 1-Click Login below or any password.', 'info')"
                        class="text-[11px] text-august-forest font-semibold hover:underline"
                      >
                        Need help?
                      </button>
                    </div>
                    <input
                      [(ngModel)]="loginPassword"
                      name="loginPassword"
                      type="password"
                      required
                      class="w-full bg-august-ivory border border-august-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-august-dark"
                    />
                  </div>

                  <button
                    type="submit"
                    class="w-full py-3.5 bg-august-forest hover:bg-august-forestHover text-white font-bold text-sm rounded-xl shadow-lg shadow-august-forest/20 transition flex items-center justify-center gap-2"
                  >
                    <span>Enter Care Portal</span>
                    <app-icon name="arrowRight" iconClass="w-4 h-4" />
                  </button>
                </form>

                <!-- 1-Click Stakeholder Demo Buttons -->
                <div class="pt-4 border-t border-august-border space-y-2.5">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-august-warmGray block">1-Click Stakeholder Demo Access:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      (click)="quickDemo('patient')"
                      class="p-3 bg-august-ivory hover:bg-august-sage/70 border border-august-border rounded-2xl text-left transition flex items-center gap-3"
                    >
                      <div class="w-9 h-9 rounded-xl bg-august-forest text-white flex items-center justify-center font-bold text-xs shrink-0">RD</div>
                      <div>
                        <span class="font-bold text-august-dark block">Robert Davis (Patient)</span>
                        <span class="text-[10px] text-red-700 font-semibold">Demo: &gt;2 lbs Alert + Symptoms</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      (click)="quickDemo('prescriber')"
                      class="p-3 bg-august-ivory hover:bg-august-sage/70 border border-august-border rounded-2xl text-left transition flex items-center gap-3"
                    >
                      <div class="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">SM</div>
                      <div>
                        <span class="font-bold text-august-dark block">Dr. Sarah Miller (MD)</span>
                        <span class="text-[10px] text-august-warmGray font-medium">Demo: Prescriber Triage EHR</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <div class="space-y-4">
                <div>
                  <h2 class="text-2xl font-serif font-medium text-august-dark">Create your account</h2>
                  <p class="text-xs text-august-warmGray mt-0.5">Select whether you are a patient or prescriber and enter your details.</p>
                </div>

                <!-- Role Choice: Patient vs Prescriber -->
                <div class="grid grid-cols-2 gap-2 p-1 bg-august-ivory rounded-2xl border border-august-border text-xs">
                  <button
                    type="button"
                    (click)="signupRole.set('patient')"
                    [class]="signupRole() === 'patient'
                      ? 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition'
                      : 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition'"
                  >
                    <app-icon name="profile" iconClass="w-4 h-4" />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    (click)="signupRole.set('prescriber')"
                    [class]="signupRole() === 'prescriber'
                      ? 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition'
                      : 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition'"
                  >
                    <app-icon name="stethoscope" iconClass="w-4 h-4" />
                    <span>Prescriber / MD</span>
                  </button>
                </div>

                <form (ngSubmit)="submitSignup()" class="space-y-3.5 text-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-august-dark mb-1">First Name</label>
                      <input [(ngModel)]="signupFirstName" name="signupFirstName" type="text" placeholder="e.g. Eleanor" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
                    </div>
                    <div>
                      <label class="block font-bold text-august-dark mb-1">Last Name</label>
                      <input [(ngModel)]="signupLastName" name="signupLastName" type="text" placeholder="e.g. Vance" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
                    </div>
                  </div>

                  <div>
                    <label class="block font-bold text-august-dark mb-1">Date of Birth</label>
                    <input [(ngModel)]="signupDob" name="signupDob" type="date" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-august-dark mb-1">Email Address</label>
                      <input [(ngModel)]="signupEmail" name="signupEmail" type="email" placeholder="name@example.com" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
                    </div>
                    <div>
                      <label class="block font-bold text-august-dark mb-1">Create Password</label>
                      <input [(ngModel)]="signupPassword" name="signupPassword" type="password" placeholder="••••••••••••" required class="w-full bg-august-ivory border border-august-border rounded-xl px-3.5 py-2.5 text-august-dark" />
                    </div>
                  </div>

                  <button type="submit" class="w-full py-3.5 bg-august-forest hover:bg-august-forestHover text-white font-bold text-sm rounded-xl shadow-lg shadow-august-forest/20 transition flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <app-icon name="arrowRight" iconClass="w-4 h-4" />
                  </button>
                </form>
              </div>
            }
          </div>

          <div class="text-[11px] text-center text-august-warmGray pt-5 mt-5 border-t border-august-border/70">
            Angular 22 Standalone • Responsive for iPhone Safari &amp; Desktop Browsers
          </div>
        </div>
      </div>
    </section>
  `
})
export class AuthComponent {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);

  readonly activeTab = signal<'login' | 'signup'>('login');
  readonly loginRole = signal<UserRole>('patient');
  readonly signupRole = signal<UserRole>('patient');
  readonly selectedAuthRole = computed<UserRole>(() =>
    this.activeTab() === 'login' ? this.loginRole() : this.signupRole()
  );

  loginEmail = 'robert.davis@patient.august.health';
  loginPassword = '••••••••••••';

  signupFirstName = '';
  signupLastName = '';
  signupDob = '1960-08-21';
  signupEmail = '';
  signupPassword = '';

  selectLoginRole(role: UserRole): void {
    this.loginRole.set(role);
    this.loginEmail =
      role === 'patient'
        ? this.care.patient().email || 'robert.davis@patient.august.health'
        : 'dr.sarah.miller@cardiology.august.health';
  }

  submitLogin(): void {
    const role = this.loginRole();
    this.care.login(role);
    this.router.navigateByUrl(role === 'prescriber' ? '/prescriber' : '/home');
  }

  quickDemo(role: UserRole): void {
    this.selectLoginRole(role);
    this.care.login(role);
    this.router.navigateByUrl(role === 'prescriber' ? '/prescriber' : '/home');
  }

  submitSignup(): void {
    const first = this.signupFirstName.trim();
    const last = this.signupLastName.trim();
    if (!first || !last) {
      this.care.showToast('Please enter your first and last name.', 'alert');
      return;
    }
    const role = this.signupRole();
    this.care.signUpAccount({
      firstName: first,
      lastName: last,
      role,
      dob: this.signupDob,
      email: this.signupEmail.trim() || `${first.toLowerCase()}.${last.toLowerCase()}@august.health`
    });
    this.router.navigateByUrl(role === 'prescriber' ? '/prescriber' : '/home');
  }
}
