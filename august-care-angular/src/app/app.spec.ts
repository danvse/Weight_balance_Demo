import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';
import { CareStateService } from './services/care-state.service';

describe('August Care Angular RPM App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default to normal weight and trigger red dashboard state on >2 lbs fluid gain', () => {
    const care = TestBed.inject(CareStateService);
    care.login('patient');
    expect(care.clinicalMetrics().isConcerning).toBe(false);
    expect(care.isRedDashboardActive()).toBe(false);

    care.toggleAlertSimulation();
    expect(care.clinicalMetrics().isConcerning).toBe(true);
    expect(care.isRedDashboardActive()).toBe(true);
  });

  it('should complete symptom gate before allowing dashboard access', () => {
    const care = TestBed.inject(CareStateService);
    care.login('patient');
    expect(care.symptomGateCompleted()).toBe(false);

    care.submitSymptoms({
      shortnessOfBreath: 'mild',
      poorAppetite: false,
      hasSwelling: true,
      swellingLocations: ['Feet & Ankles'],
      swellingOther: '',
      submittedAt: null
    });

    expect(care.symptomGateCompleted()).toBe(true);
    expect(care.symptomSummary()).toContain('Feet & Ankles');
    expect(care.weightHistory()[0].symptoms?.swellingLocations).toContain('Feet & Ankles');
    expect(care.todaySymptomSeverity()).toBe('severe');
    expect(care.chatMessages().some(m => m.id === 'sys-symptom-today')).toBe(true);
  });

  it('should support signing up with first/last name as patient or prescriber', () => {
    const care = TestBed.inject(CareStateService);
    care.signUpAccount({
      firstName: 'Eleanor',
      lastName: 'Vance',
      role: 'patient',
      dob: '1960-08-21',
      email: 'eleanor@example.com'
    });
    expect(care.isAuthenticated()).toBe(true);
    expect(care.userRole()).toBe('patient');
    expect(care.patient().name).toBe('Eleanor Vance');

    care.signUpAccount({
      firstName: 'Marcus',
      lastName: 'Lee',
      role: 'prescriber',
      dob: '1975-02-10',
      email: 'marcus.lee@clinic.org'
    });
    expect(care.userRole()).toBe('prescriber');
    expect(care.patient().prescriberName).toBe('Dr. Marcus Lee, MD');
  });

  it('should play the mascot loader for 2 seconds when switching tabs', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(App);
      const care = TestBed.inject(CareStateService);
      const router = TestBed.inject(Router);
      care.login('patient');
      fixture.detectChanges();

      await router.navigateByUrl('/home');
      fixture.detectChanges();
      expect(care.isTabLoading()).toBe(false);

      const navPromise = router.navigateByUrl('/chat');
      await vi.advanceTimersByTimeAsync(100);
      fixture.detectChanges();

      expect(care.isTabLoading()).toBe(true);
      expect(router.url).toBe('/home');
      const loaderVideo = fixture.nativeElement.querySelector('app-mascot-loader video') as HTMLVideoElement | null;
      expect(loaderVideo?.getAttribute('src')).toBe('mascot-loader.mp4');

      await vi.advanceTimersByTimeAsync(1700);
      await navPromise;
      fixture.detectChanges();

      expect(care.isTabLoading()).toBe(false);
      expect(router.url).toBe('/chat');
      expect(fixture.nativeElement.querySelector('app-mascot-loader')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('should compute dynamic BMI, weight goal progress, unit conversion, and fluid intake', () => {
    const care = TestBed.inject(CareStateService);

    const bmi = care.bmiInfo();
    expect(bmi.score).toBe(24.7);
    expect(bmi.category).toBe('Healthy');
    expect(bmi.heightDisplay).toBe(`5' 10"`);
    expect(bmi.ageYears).toBeGreaterThanOrEqual(67);

    const goal = care.goalProgress();
    expect(goal.startWeight).toBe(176.0);
    expect(goal.currentWeight).toBe(172.1);
    expect(goal.goalWeight).toBe(168.0);
    expect(goal.percent).toBe(49);
    expect(goal.onTrack).toBe(true);

    expect(care.weightUnit()).toBe('lbs');
    care.weightUnit.set('kg');
    expect(care.convertWeight(172.1)).toBeCloseTo(78.1, 1);

    const startFluid = care.patient().fluidIntakeOz;
    care.adjustFluidIntake(8);
    expect(care.patient().fluidIntakeOz).toBe(startFluid + 8);
  });
});
