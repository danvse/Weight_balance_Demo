import { Injectable, computed, effect, signal } from '@angular/core';
import {
  AdherenceStatus,
  BmiInfo,
  BreathStatus,
  ChatMessage,
  ClinicalMetrics,
  GoalProgressInfo,
  MedicationAdherenceSummary,
  MedicationItem,
  PatientProfile,
  PeriodPoint,
  PrescriberUpdate,
  SymptomCheck,
  SymptomSeverity,
  TimeRange,
  ToastItem,
  UserRole,
  VitalSigns,
  VitalsStatusInfo,
  WeightEntry,
  WeightUnit
} from '../models/care.models';

const STORAGE_KEY = 'august_care_angular_rpm_v6';

interface PersistedState {
  isAuthenticated: boolean;
  userRole: UserRole;
  symptomGateCompleted: boolean;
  alertAcknowledged: boolean;
  currentRange: TimeRange;
  weightUnit: WeightUnit;
  patient: PatientProfile;
  todaySymptoms: SymptomCheck;
  prescriberUpdate: PrescriberUpdate;
  weightHistory: WeightEntry[];
  weeklyHistory: PeriodPoint[];
  monthlyHistory: PeriodPoint[];
  chatMessages: ChatMessage[];
  unreadChatCount: number;
}

const DEFAULT_PERSISTED: PersistedState = {
  isAuthenticated: false,
  userRole: 'patient',
  symptomGateCompleted: false,
  alertAcknowledged: false,
  currentRange: 'days',
  weightUnit: 'lbs',
  patient: {
    name: 'Robert Davis',
    dob: '1958-04-14',
    email: 'robert.davis@patient.august.health',
    heightInches: 70,
    baselineWeight: 172.0,
    startWeightLbs: 176.0,
    goalWeightLbs: 168.0,
    fluidIntakeOz: 32,
    fluidLimitOz: 50,
    sleepHours: 7.8,
    lastVisitDate: '2026-11-12',
    nextVisitDate: '2026-12-15',
    serialNumber: 'MATT-8492-BLE',
    prescriberName: 'Dr. Sarah Miller, MD',
    prescriberSpecialty: 'Cardiology Clinic',
    medications: [
      { id: 1, name: 'Furosemide (Lasix)', dose: '40 mg', frequency: 'Once daily • Morning', isDiuretic: true, takenToday: true, takenAt: '6:35 AM' },
      { id: 2, name: 'Spironolactone', dose: '25 mg', frequency: 'Once daily • Morning', isDiuretic: true, takenToday: true, takenAt: '6:35 AM' },
      { id: 3, name: 'Carvedilol', dose: '12.5 mg', frequency: 'Twice daily • Morning & Evening', isDiuretic: false, takenToday: false, takenAt: null }
    ]
  },
  todaySymptoms: {
    shortnessOfBreath: 'none',
    poorAppetite: false,
    hasSwelling: false,
    swellingLocations: [],
    swellingOther: '',
    vitals: { systolicBp: 118, diastolicBp: 74, heartRate: 72, spo2: 97, source: 'bluetooth' },
    submittedAt: null
  },
  prescriberUpdate: {
    author: 'Dr. Sarah Miller, MD',
    specialty: 'Cardiology Clinic',
    timestamp: 'Today, 7:45 AM',
    message:
      'Robert, if your morning mattress scale reading rises more than 2 lbs above your 172.0 lb dry baseline or you notice ankle swelling, take an extra 20 mg Furosemide with breakfast and limit fluids to 1.5 L today.',
    acknowledged: false
  },
  weightHistory: [
    {
      id: 7,
      dateLabel: 'Today',
      fullDate: 'Nov 24',
      weight: 172.1,
      syncTime: '6:15 AM',
      vitals: { systolicBp: 118, diastolicBp: 74, heartRate: 72, spo2: 97, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 2,
      medicationsTotalCount: 3
    },
    {
      id: 6,
      dateLabel: 'Yesterday',
      fullDate: 'Nov 23',
      weight: 172.0,
      syncTime: '6:08 AM',
      vitals: { systolicBp: 120, diastolicBp: 76, heartRate: 70, spo2: 98, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 3,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:14 AM' }
    },
    {
      id: 5,
      dateLabel: 'Nov 22',
      fullDate: 'Nov 22',
      weight: 172.2,
      syncTime: '6:22 AM',
      vitals: { systolicBp: 124, diastolicBp: 78, heartRate: 75, spo2: 96, source: 'manual' },
      diureticAdherence: 'missed',
      medicationsTakenCount: 1,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: true, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:30 AM' }
    },
    {
      id: 4,
      dateLabel: 'Nov 21',
      fullDate: 'Nov 21',
      weight: 171.8,
      syncTime: '6:11 AM',
      vitals: { systolicBp: 116, diastolicBp: 72, heartRate: 68, spo2: 98, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 3,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:20 AM' }
    },
    {
      id: 3,
      dateLabel: 'Nov 20',
      fullDate: 'Nov 20',
      weight: 172.1,
      syncTime: '6:19 AM',
      vitals: { systolicBp: 119, diastolicBp: 75, heartRate: 71, spo2: 97, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 3,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:25 AM' }
    },
    {
      id: 2,
      dateLabel: 'Nov 19',
      fullDate: 'Nov 19',
      weight: 171.9,
      syncTime: '6:05 AM',
      vitals: { systolicBp: 117, diastolicBp: 73, heartRate: 69, spo2: 98, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 3,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:12 AM' }
    },
    {
      id: 1,
      dateLabel: 'Nov 18',
      fullDate: 'Nov 18',
      weight: 172.0,
      syncTime: '6:14 AM',
      vitals: { systolicBp: 121, diastolicBp: 75, heartRate: 73, spo2: 97, source: 'bluetooth' },
      diureticAdherence: 'taken',
      medicationsTakenCount: 3,
      medicationsTotalCount: 3,
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:19 AM' }
    }
  ],
  weeklyHistory: [
    { label: 'Oct 19', weight: 172.8 },
    { label: 'Oct 26', weight: 173.4 },
    { label: 'Nov 2', weight: 172.5 },
    { label: 'Nov 9', weight: 172.1 },
    { label: 'Nov 16', weight: 171.9 },
    { label: 'This Wk', weight: 172.1 }
  ],
  monthlyHistory: [
    { label: 'Jun', weight: 171.5 },
    { label: 'Jul', weight: 172.0 },
    { label: 'Aug', weight: 171.8 },
    { label: 'Sep', weight: 172.2 },
    { label: 'Oct', weight: 172.0 },
    { label: 'Nov', weight: 172.1 }
  ],
  chatMessages: [
    {
      id: 'doc-1',
      sender: 'prescriber',
      text: 'Good morning Robert! Your nocturnal mattress scale readings have stayed steady right around your 172.0 lb dry baseline. Keep logging your morning check-ins and message me anytime.',
      time: '8:10 AM'
    },
    {
      id: 'pat-1',
      sender: 'patient',
      text: 'Thanks Dr. Miller! Sleeping well and taking my morning medications as scheduled.',
      time: '8:22 AM'
    }
  ],
  unreadChatCount: 0
};

@Injectable({ providedIn: 'root' })
export class CareStateService {
  private readonly initial = this.loadInitial();

  readonly isAuthenticated = signal<boolean>(this.initial.isAuthenticated);
  readonly userRole = signal<UserRole>(this.initial.userRole);
  readonly symptomGateCompleted = signal<boolean>(this.initial.symptomGateCompleted);
  readonly alertAcknowledged = signal<boolean>(this.initial.alertAcknowledged);
  readonly currentRange = signal<TimeRange>(this.initial.currentRange);
  readonly weightUnit = signal<WeightUnit>(this.initial.weightUnit ?? 'lbs');
  readonly patient = signal<PatientProfile>(this.initial.patient);
  readonly todaySymptoms = signal<SymptomCheck>(this.initial.todaySymptoms);
  readonly prescriberUpdate = signal<PrescriberUpdate>(this.initial.prescriberUpdate);
  readonly weightHistory = signal<WeightEntry[]>(this.initial.weightHistory);
  readonly weeklyHistory = signal<PeriodPoint[]>(this.initial.weeklyHistory);
  readonly monthlyHistory = signal<PeriodPoint[]>(this.initial.monthlyHistory);
  readonly chatMessages = signal<ChatMessage[]>(this.initial.chatMessages);
  readonly unreadChatCount = signal<number>(this.initial.unreadChatCount);
  readonly isDoctorTyping = signal<boolean>(false);
  readonly toasts = signal<ToastItem[]>([]);
  readonly isTabLoading = signal<boolean>(false);
  readonly tabLoadingLabel = signal<string>('Fetching your care page...');
  hasActivatedInitialPage = false;

  readonly clinicalMetrics = computed<ClinicalMetrics>(() => {
    const history = this.weightHistory();
    const latest = history[0];
    const prev = history[1] ?? { weight: this.patient().baselineWeight };
    const baseline = Number(this.patient().baselineWeight) || 172.0;

    const overnightDelta = Number((latest.weight - prev.weight).toFixed(1));
    const baselineDelta = Number((latest.weight - baseline).toFixed(1));
    const isConcerning = overnightDelta > 2.0 || baselineDelta > 2.0;

    return {
      latestWeight: latest.weight,
      syncTime: latest.syncTime,
      prevWeight: prev.weight,
      baseline,
      overnightDelta,
      baselineDelta,
      isConcerning
    };
  });

  readonly userInitials = computed(() => {
    if (this.userRole() === 'prescriber') return 'SM';
    return (
      this.patient()
        .name.split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'PT'
    );
  });

  readonly symptomSummary = computed(() => {
    const s = this.todaySymptoms();
    const breathMap: Record<BreathStatus, string> = {
      none: 'Breathing normal',
      mild: 'SOB w/ activity',
      rest: 'SOB at rest'
    };
    const swellTxt = s.hasSwelling
      ? `Swelling: ${[...s.swellingLocations, s.swellingOther].filter(Boolean).join(', ')}`
      : 'No swelling';
    return this.symptomGateCompleted()
      ? `${breathMap[s.shortnessOfBreath]} • ${s.poorAppetite ? 'Poor appetite' : 'Normal appetite'} • ${swellTxt}`
      : 'Awaiting morning check-in';
  });

  readonly daysSinceLastVisit = computed(() => {
    const dateStr = this.patient().lastVisitDate;
    if (!dateStr) return 'Not recorded';
    const visit = new Date(`${dateStr}T00:00:00`);
    const refToday = new Date('2026-11-24T00:00:00');
    const diffDays = Math.round((refToday.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays > 1) return `${diffDays} days ago`;
    return `In ${Math.abs(diffDays)} days`;
  });

  readonly todaySymptomSeverity = computed<SymptomSeverity>(() =>
    this.getSymptomSeverity(this.todaySymptoms())
  );

  readonly checkInCountLast7Days = computed<number>(() =>
    this.weightHistory().filter(entry => Boolean(entry.symptoms?.submittedAt)).length
  );

  readonly bmiInfo = computed<BmiInfo>(() => {
    const p = this.patient();
    const weightLbs = this.clinicalMetrics().latestWeight;
    const heightIn = Math.max(48, Number(p.heightInches) || 70);
    const score = Number(((weightLbs * 703) / (heightIn * heightIn)).toFixed(1));

    let category: BmiInfo['category'] = 'Healthy';
    if (score < 18.5) category = 'Underweight';
    else if (score < 25.0) category = 'Healthy';
    else if (score < 30.0) category = 'Overweight';
    else category = 'Obese';

    const dob = new Date(`${p.dob || '1958-04-14'}T00:00:00`);
    const ref = new Date('2026-11-25T00:00:00');
    let ageYears = ref.getFullYear() - dob.getFullYear();
    const mDiff = ref.getMonth() - dob.getMonth();
    if (mDiff < 0 || (mDiff === 0 && ref.getDate() < dob.getDate())) {
      ageYears--;
    }

    const feet = Math.floor(heightIn / 12);
    const inches = Math.round(heightIn % 12);

    return {
      score,
      category,
      ageYears: Math.max(1, ageYears),
      heightDisplay: `${feet}' ${inches}"`
    };
  });

  readonly goalProgress = computed<GoalProgressInfo>(() => {
    const p = this.patient();
    const currentWeight = this.clinicalMetrics().latestWeight;
    const startWeight = Number(p.startWeightLbs) || 176.0;
    const goalWeight = Number(p.goalWeightLbs) || 168.0;
    const totalToLose = Math.max(0.1, startWeight - goalWeight);
    const lostLbs = Number((startWeight - currentWeight).toFixed(1));
    const leftLbs = Number(Math.max(0, currentWeight - goalWeight).toFixed(1));
    const percent = Math.round(Math.min(100, Math.max(0, (lostLbs / totalToLose) * 100)));
    const arcLen = 220;
    const arcDashOffset = Number((arcLen - (arcLen * percent) / 100).toFixed(1));

    return {
      startWeight,
      currentWeight,
      goalWeight,
      lostLbs,
      leftLbs,
      percent,
      arcDashOffset,
      onTrack: !this.clinicalMetrics().isConcerning && currentWeight <= startWeight
    };
  });

  readonly trendStats = computed(() => {
    const history = this.weightHistory();
    const latest = history[0]?.weight ?? this.patient().baselineWeight;
    const oldest7 = history[history.length - 1]?.weight ?? latest;
    const earliest30 = this.weeklyHistory()[0]?.weight ?? latest;
    const sorted = history.map(h => h.weight).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));

    return {
      last7Days: Number((latest - oldest7).toFixed(1)),
      last30Days: Number((latest - earliest30).toFixed(1)),
      allTime: Number((latest - this.patient().startWeightLbs).toFixed(1)),
      medianWeight: median
    };
  });

  readonly adherenceSummary = computed<MedicationAdherenceSummary>(() => {
    const meds = this.patient().medications;
    const totalCount = meds.length;
    const takenCount = meds.filter(m => m.takenToday).length;
    const adherencePercent = totalCount ? Math.round((takenCount / totalCount) * 100) : 100;

    const diuretics = meds.filter(m => m.isDiuretic);
    const diureticTotalCount = diuretics.length;
    const diureticTakenCount = diuretics.filter(m => m.takenToday).length;

    let todayDiureticStatus: MedicationAdherenceSummary['todayDiureticStatus'] = 'none';
    if (diureticTotalCount > 0) {
      if (diureticTakenCount === diureticTotalCount) todayDiureticStatus = 'taken';
      else if (diureticTakenCount > 0) todayDiureticStatus = 'partial';
      else todayDiureticStatus = 'missed';
    }

    const history = this.weightHistory();
    const adMap: Record<AdherenceStatus, number> = { taken: 1, partial: 0.5, missed: 0 };
    const sevenDayRatePercent = history.length
      ? Math.round(
          (history.reduce((sum, entry) => sum + adMap[entry.diureticAdherence ?? 'taken'], 0) / history.length) * 100
        )
      : 100;

    const m = this.clinicalMetrics();
    const maxGain = Math.max(m.overnightDelta, m.baselineDelta);
    const missedTodayDiuretic = todayDiureticStatus === 'missed' || todayDiureticStatus === 'partial';
    const missedDiureticAlert = missedTodayDiuretic && (m.isConcerning || maxGain >= 1.0);

    const missedHistoryDay = history.find(
      (row, idx) => idx > 0 && (row.diureticAdherence === 'missed' || row.diureticAdherence === 'partial')
    );

    let correlationNote = `All ${diureticTotalCount} diuretic dose(s) taken today — fluid retention risk stays low.`;
    if (missedDiureticAlert) {
      const missedCount = diureticTotalCount - diureticTakenCount;
      correlationNote = `Weight gain (${this.formatDelta(maxGain)}) coincides with ${missedCount} missed diuretic dose(s) today — verify adherence before escalating therapy.`;
    } else if (missedTodayDiuretic) {
      correlationNote = `${diureticTotalCount - diureticTakenCount} morning diuretic dose(s) still unchecked — timely dosing helps prevent overnight fluid retention.`;
    } else if (missedHistoryDay) {
      correlationNote = `Today's diuretics taken (7-day adherence ${sevenDayRatePercent}%). Minor fluid uptick on ${missedHistoryDay.fullDate} coincided with a missed diuretic dose.`;
    }

    return {
      takenCount,
      totalCount,
      adherencePercent,
      diureticTakenCount,
      diureticTotalCount,
      todayDiureticStatus,
      sevenDayRatePercent,
      missedDiureticAlert,
      correlationNote
    };
  });

  readonly vitalsStatus = computed<VitalsStatusInfo>(() => {
    const v = this.todaySymptoms().vitals ?? this.weightHistory()[0]?.vitals;
    return this.evaluateVitals(v);
  });

  readonly isRedDashboardActive = computed(
    () => this.isAuthenticated() && this.userRole() === 'patient' && this.clinicalMetrics().isConcerning
  );

  constructor() {
    effect(() => {
      const payload: PersistedState = {
        isAuthenticated: this.isAuthenticated(),
        userRole: this.userRole(),
        symptomGateCompleted: this.symptomGateCompleted(),
        alertAcknowledged: this.alertAcknowledged(),
        currentRange: this.currentRange(),
        weightUnit: this.weightUnit(),
        patient: this.patient(),
        todaySymptoms: this.todaySymptoms(),
        prescriberUpdate: this.prescriberUpdate(),
        weightHistory: this.weightHistory(),
        weeklyHistory: this.weeklyHistory(),
        monthlyHistory: this.monthlyHistory(),
        chatMessages: this.chatMessages(),
        unreadChatCount: this.unreadChatCount()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage errors
      }
    });

    effect(() => {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('dashboard-alert-red', this.isRedDashboardActive());
      }
    });
  }

  private loadInitial(): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as PersistedState;
      }
    } catch {
      // Ignore parse errors
    }
    return structuredClone(DEFAULT_PERSISTED);
  }

  showToast(message: string, type: 'success' | 'alert' | 'info' = 'success'): void {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 3200);
  }

  playAlarmChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.14 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.14);
        osc.stop(ctx.currentTime + idx * 0.14 + 0.36);
      });
    } catch {
      // Audio blocked by browser
    }
  }

  login(role: UserRole): void {
    this.isAuthenticated.set(true);
    this.userRole.set(role);
  }

  signUpAccount(data: {
    firstName: string;
    lastName: string;
    role: UserRole;
    dob: string;
    email: string;
  }): void {
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    if (data.role === 'prescriber') {
      const drName = fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}, MD`;
      this.patient.update(p => ({ ...p, prescriberName: drName }));
      this.isAuthenticated.set(true);
      this.userRole.set('prescriber');
      this.showToast(`Welcome, ${drName}! Signed in to Prescriber EHR.`, 'success');
      return;
    }

    this.patient.update(p => ({
      ...p,
      name: fullName,
      dob: data.dob,
      email: data.email
    }));

    this.symptomGateCompleted.set(false);
    this.alertAcknowledged.set(false);
    this.isAuthenticated.set(true);
    this.userRole.set('patient');
    this.showToast(`Welcome, ${fullName}! Your patient account is ready.`, 'success');
  }

  signOut(): void {
    this.isAuthenticated.set(false);
    this.hasActivatedInitialPage = false;
    this.isTabLoading.set(false);
    this.showToast('Signed out securely.', 'info');
  }

  switchRole(role: UserRole): void {
    this.userRole.set(role);
  }

  submitSymptoms(symptoms: SymptomCheck): void {
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const submitted: SymptomCheck = { ...symptoms, submittedAt: timeStr };

    this.todaySymptoms.set(submitted);
    this.weightHistory.update(rows =>
      rows.map((r, i) =>
        i === 0 ? { ...r, symptoms: submitted, vitals: submitted.vitals ?? r.vitals } : r
      )
    );
    this.symptomGateCompleted.set(true);

    const severity = this.getSymptomSeverity(submitted);
    const chips = this.formatSymptomChips(submitted);
    const vitalsEval = this.evaluateVitals(submitted.vitals);

    // Automatically log mild/severe symptoms or abnormal vitals to Prescriber Chat
    if (severity !== 'clear' || vitalsEval.isConcerning) {
      const metrics = this.clinicalMetrics();
      const vitalsText = vitalsEval.hasReading ? ` • Vitals: ${vitalsEval.summaryLabel}` : '';
      const alertText = vitalsEval.alertReasons.length ? ` • Alerts: ${vitalsEval.alertReasons.join(', ')}` : '';
      const cardText = `Morning Health Check (${timeStr}): ${chips.join(', ')}${vitalsText}${alertText} • Mattress weight ${metrics.latestWeight.toFixed(1)} lbs (${this.formatDelta(metrics.baselineDelta)} vs baseline).`;
      this.chatMessages.update(list => {
        const filtered = list.filter(m => m.id !== 'sys-symptom-today');
        return [
          ...filtered,
          { id: 'sys-symptom-today', sender: 'system', text: cardText, time: timeStr }
        ];
      });
      if (severity === 'severe' || vitalsEval.isConcerning) {
        this.unreadChatCount.update(c => c + 1);
      }
    } else {
      this.chatMessages.update(list => list.filter(m => m.id !== 'sys-symptom-today'));
    }

    if (
      (this.clinicalMetrics().isConcerning && !this.alertAcknowledged()) ||
      submitted.shortnessOfBreath === 'rest' ||
      vitalsEval.isConcerning
    ) {
      this.playAlarmChime();
    }

    if (vitalsEval.isConcerning) {
      this.showToast(`Urgent Vitals Alert: ${vitalsEval.alertReasons.join(', ')}. Contact Dr. Miller.`, 'alert');
    } else if (submitted.shortnessOfBreath === 'rest') {
      this.showToast('Urgent: Breathing trouble at rest logged. Please contact Dr. Miller.', 'alert');
    } else if (severity !== 'clear') {
      this.showToast('Morning symptoms logged and shared with Dr. Miller in Chat.', 'info');
    } else {
      this.showToast('Morning health check & vitals logged — looking good today!', 'success');
    }
  }

  evaluateVitals(v?: VitalSigns): VitalsStatusInfo {
    const latest: VitalSigns = v ?? { systolicBp: null, diastolicBp: null, heartRate: null, spo2: null };
    const hasReading =
      latest.systolicBp != null || latest.diastolicBp != null || latest.heartRate != null || latest.spo2 != null;

    const isHypotensive =
      (latest.systolicBp != null && latest.systolicBp < 95) ||
      (latest.diastolicBp != null && latest.diastolicBp < 60);
    const isHypertensive =
      (latest.systolicBp != null && latest.systolicBp >= 160) ||
      (latest.diastolicBp != null && latest.diastolicBp >= 100);
    const isHypoxic = latest.spo2 != null && latest.spo2 < 92;
    const isTachyOrBrady = latest.heartRate != null && (latest.heartRate > 110 || latest.heartRate < 50);

    const alertReasons: string[] = [];
    if (isHypotensive) {
      alertReasons.push(`Low BP (${latest.systolicBp ?? '--'}/${latest.diastolicBp ?? '--'} mmHg)`);
    }
    if (isHypertensive) {
      alertReasons.push(`High BP (${latest.systolicBp ?? '--'}/${latest.diastolicBp ?? '--'} mmHg)`);
    }
    if (isHypoxic) {
      alertReasons.push(`Low SpO₂ (${latest.spo2}%)`);
    }
    if (isTachyOrBrady) {
      alertReasons.push(`Abnormal HR (${latest.heartRate} bpm)`);
    }

    const isConcerning = alertReasons.length > 0;
    const isWatch =
      !isConcerning &&
      ((latest.spo2 != null && latest.spo2 <= 94) ||
        (latest.systolicBp != null && latest.systolicBp >= 140) ||
        (latest.heartRate != null && latest.heartRate >= 95));

    const severity: VitalsStatusInfo['severity'] = isConcerning ? 'urgent' : isWatch ? 'watch' : 'normal';

    return {
      latest,
      hasReading,
      isHypotensive,
      isHypertensive,
      isHypoxic,
      isTachyOrBrady,
      isConcerning,
      severity,
      summaryLabel: this.formatVitalsShort(latest),
      alertReasons
    };
  }

  formatVitalsShort(v?: VitalSigns): string {
    if (!v || (v.systolicBp == null && v.diastolicBp == null && v.heartRate == null && v.spo2 == null)) {
      return 'No vitals logged';
    }
    const parts: string[] = [];
    if (v.systolicBp != null && v.diastolicBp != null) {
      parts.push(`BP ${v.systolicBp}/${v.diastolicBp}`);
    }
    if (v.heartRate != null) {
      parts.push(`HR ${v.heartRate}`);
    }
    if (v.spo2 != null) {
      parts.push(`SpO₂ ${v.spo2}%`);
    }
    return parts.join(' • ');
  }

  getSymptomSeverity(s?: SymptomCheck): SymptomSeverity {
    if (!s || !s.submittedAt) return 'clear';
    if (
      s.shortnessOfBreath === 'rest' ||
      (s.hasSwelling && s.swellingLocations.length >= 2) ||
      (s.shortnessOfBreath === 'mild' && s.hasSwelling)
    ) {
      return 'severe';
    }
    if (s.shortnessOfBreath !== 'none' || s.poorAppetite || s.hasSwelling) {
      return 'mild';
    }
    return 'clear';
  }

  formatSymptomChips(s?: SymptomCheck): string[] {
    if (!s || !s.submittedAt) return ['Pending'];
    const chips: string[] = [];
    if (s.shortnessOfBreath === 'rest') chips.push('SOB at rest');
    else if (s.shortnessOfBreath === 'mild') chips.push('SOB w/ activity');
    if (s.poorAppetite) chips.push('Poor appetite');
    if (s.hasSwelling) {
      const locs = [...s.swellingLocations, s.swellingOther].filter(Boolean);
      chips.push(locs.length ? `Swelling: ${locs.join(', ')}` : 'Swelling');
    }
    return chips.length ? chips : ['All clear'];
  }

  reopenSymptomGate(): void {
    this.symptomGateCompleted.set(false);
  }

  toggleAlertSimulation(): void {
    const metrics = this.clinicalMetrics();
    const prevWeight = this.weightHistory()[1]?.weight ?? this.patient().baselineWeight;

    if (metrics.isConcerning) {
      const normalWeight = Number((this.patient().baselineWeight + 0.1).toFixed(1));
      this.updateLatestWeight(normalWeight);
      this.alertAcknowledged.set(false);
      this.chatMessages.update(list => list.filter(m => m.id !== 'sys-weight-spike'));
      this.showToast(`Simulated normal morning reading: ${normalWeight} lbs`, 'success');
    } else {
      const spikeWeight = Number((Math.max(prevWeight, this.patient().baselineWeight) + 2.6).toFixed(1));
      this.updateLatestWeight(spikeWeight);
      this.alertAcknowledged.set(false);
      this.chatMessages.update(list => [
        ...list.filter(m => m.id !== 'sys-weight-spike'),
        {
          id: 'sys-weight-spike',
          sender: 'system',
          text: `Mattress Scale recorded a concerning weight of ${spikeWeight.toFixed(1)} lbs (+2.6 lbs > 2.0 lb safety limit).`,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }
      ]);
      this.playAlarmChime();
      this.showToast(`Alert triggered: Weight spiked to ${spikeWeight} lbs (>2 lbs)`, 'alert');
    }
  }

  private updateLatestWeight(weight: number): void {
    this.weightHistory.update(rows =>
      rows.map((r, i) => (i === 0 ? { ...r, weight } : r))
    );
    this.weeklyHistory.update(rows =>
      rows.map((r, i) => (i === rows.length - 1 ? { ...r, weight } : r))
    );
    this.monthlyHistory.update(rows =>
      rows.map((r, i) => (i === rows.length - 1 ? { ...r, weight } : r))
    );
  }

  acknowledgeWeightAlert(): void {
    this.alertAcknowledged.set(true);
    this.showToast('Weight alert acknowledged. Remember to follow your fluid plan.', 'info');
  }

  acknowledgePrescriberUpdate(): void {
    this.prescriberUpdate.update(u => ({ ...u, acknowledged: true }));
    this.showToast('Care plan update marked as read.', 'success');
  }

  updateProfile(
    patch: Partial<
      Pick<
        PatientProfile,
        'name' | 'dob' | 'heightInches' | 'baselineWeight' | 'startWeightLbs' | 'goalWeightLbs' | 'fluidLimitOz' | 'lastVisitDate'
      >
    >
  ): void {
    this.patient.update(p => ({ ...p, ...patch }));
    this.alertAcknowledged.set(false);
    this.showToast('Profile, BMI metrics, and weight goal saved.', 'success');
  }

  adjustFluidIntake(deltaOz: number): void {
    let nextOz = 0;
    let limit = 50;
    this.patient.update(p => {
      limit = p.fluidLimitOz;
      nextOz = Math.max(0, Math.min(120, p.fluidIntakeOz + deltaOz));
      return { ...p, fluidIntakeOz: nextOz };
    });
    if (nextOz > limit && deltaOz > 0) {
      this.showToast(`Fluid intake (${nextOz} oz) exceeded your ${limit} oz daily limit.`, 'alert');
    }
  }

  convertWeight(lbs: number): number {
    return this.weightUnit() === 'kg' ? Number((lbs * 0.453592).toFixed(1)) : Number(lbs.toFixed(1));
  }

  formatWeight(lbs: number): string {
    return `${this.convertWeight(lbs).toFixed(1)} ${this.weightUnit()}`;
  }

  addMedication(med: Omit<MedicationItem, 'id' | 'takenToday'>): void {
    this.patient.update(p => ({
      ...p,
      medications: [...p.medications, { ...med, id: Date.now(), takenToday: false, takenAt: null }]
    }));
    this.syncTodayAdherenceToHistory();
    this.showToast(`${med.name} added to your medication list.`, 'success');
  }

  toggleMedicationTaken(id: number): void {
    let targetName = '';
    let nextState = false;
    const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    this.patient.update(p => ({
      ...p,
      medications: p.medications.map(m => {
        if (m.id === id) {
          targetName = m.name;
          nextState = !m.takenToday;
          return { ...m, takenToday: nextState, takenAt: nextState ? nowTime : null };
        }
        return m;
      })
    }));
    this.syncTodayAdherenceToHistory();

    if (targetName) {
      this.showToast(nextState ? `Marked ${targetName} taken at ${nowTime}.` : `Unmarked ${targetName} — adherence synced.`, 'info');
    }
  }

  markAllMedicationsTaken(): void {
    const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    let newlyMarked = 0;
    this.patient.update(p => ({
      ...p,
      medications: p.medications.map(m => {
        if (!m.takenToday) newlyMarked++;
        return { ...m, takenToday: true, takenAt: m.takenAt || nowTime };
      })
    }));
    this.syncTodayAdherenceToHistory();
    if (newlyMarked > 0) {
      this.showToast(`Marked ${newlyMarked} remaining dose(s) taken today.`, 'success');
    } else {
      this.showToast('All prescribed medications are already checked off for today.', 'info');
    }
  }

  removeMedication(id: number): void {
    const found = this.patient().medications.find(m => m.id === id);
    this.patient.update(p => ({
      ...p,
      medications: p.medications.filter(m => m.id !== id)
    }));
    this.syncTodayAdherenceToHistory();
    if (found) this.showToast(`Removed ${found.name}.`, 'info');
  }

  private syncTodayAdherenceToHistory(): void {
    const meds = this.patient().medications;
    const diuretics = meds.filter(m => m.isDiuretic);
    const diureticsTaken = diuretics.filter(m => m.takenToday).length;
    const status: AdherenceStatus =
      diuretics.length === 0 || diureticsTaken === diuretics.length
        ? 'taken'
        : diureticsTaken > 0
          ? 'partial'
          : 'missed';

    this.weightHistory.update(rows =>
      rows.map((r, idx) =>
        idx === 0
          ? {
              ...r,
              diureticAdherence: status,
              medicationsTakenCount: meds.filter(m => m.takenToday).length,
              medicationsTotalCount: meds.length
            }
          : r
      )
    );
  }

  sendPatientChat(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    this.chatMessages.update(list => [
      ...list,
      { id: 'msg-' + Date.now(), sender: 'patient', text: trimmed, time: now }
    ]);

    this.isDoctorTyping.set(true);
    setTimeout(() => {
      this.isDoctorTyping.set(false);
      const metrics = this.clinicalMetrics();
      const lower = trimmed.toLowerCase();
      let reply =
        'Thanks for sharing that update. I have noted it in your chart—please keep monitoring your nocturnal mattress weight tomorrow morning.';

      if (lower.includes('furosemide') || lower.includes('lasix') || lower.includes('pill') || lower.includes('diuretic')) {
        reply =
          'Yes, since your weight is above your 2 lb threshold, please follow your morning step-up dose as listed in your Care Update and keep fluids under 1.5 L today.';
      } else if (
        lower.includes('bp') ||
        lower.includes('blood pressure') ||
        lower.includes('spo2') ||
        lower.includes('oxygen') ||
        lower.includes('heart rate') ||
        lower.includes('dizzy')
      ) {
        reply =
          'Thank you for sending your blood pressure, heart rate, and SpO₂ readings. Sit or lie down if you feel lightheaded, hold extra diuretic doses if your systolic BP is below 95 mmHg, and call our clinic if SpO₂ stays below 92%.';
      } else if (lower.includes('swelling') || lower.includes('breath') || lower.includes('chest')) {
        reply =
          'I’m reviewing your symptom report right now. If your shortness of breath worsens at rest, please call our triage nurse line immediately or seek urgent care.';
      } else if (metrics.isConcerning) {
        reply = `I received your message along with today’s ${metrics.latestWeight.toFixed(1)} lb mattress reading. Let’s check tomorrow morning’s reading closely—I’ll also call if the weight doesn’t drop by 1 lb.`;
      }

      this.chatMessages.update(list => [
        ...list,
        {
          id: 'doc-' + Date.now(),
          sender: 'prescriber',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }
      ]);
    }, 1100);
  }

  shareVitalsInChat(): void {
    const m = this.clinicalMetrics();
    const ad = this.adherenceSummary();
    const v = this.vitalsStatus();
    const vitalsStr = v.hasReading ? ` • Vitals: ${v.summaryLabel}` : '';
    const summary = `📊 Shared Vitals Update: Mattress weight ${m.latestWeight.toFixed(1)} lbs (${this.formatDelta(m.baselineDelta)} vs baseline)${vitalsStr} • Meds: ${ad.takenCount}/${ad.totalCount} taken (Diuretics: ${ad.todayDiureticStatus}). Symptoms: ${this.symptomSummary()}.`;
    this.sendPatientChat(summary);
  }

  markChatRead(): void {
    this.unreadChatCount.set(0);
  }

  publishPrescriberUpdate(note: string): void {
    const trimmed = note.trim();
    if (!trimmed) {
      this.showToast('Please enter a clinical update message.', 'alert');
      return;
    }
    this.prescriberUpdate.set({
      author: this.patient().prescriberName,
      specialty: this.patient().prescriberSpecialty,
      timestamp: 'Just now',
      message: trimmed,
      acknowledged: false
    });
    this.chatMessages.update(list => [
      ...list,
      {
        id: 'doc-order-' + Date.now(),
        sender: 'prescriber',
        text: `📋 New Care Update Posted: "${trimmed}"`,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }
    ]);
    this.unreadChatCount.update(c => c + 1);
    this.showToast('Care update published to Patient Dashboard & Chat.', 'success');
  }

  formatDelta(val: number): string {
    const fixed = Number(val).toFixed(1);
    return val > 0 ? `+${fixed} lbs` : `${fixed} lbs`;
  }

  formatFriendlyDate(dateStr: string): string {
    if (!dateStr) return 'Not set';
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
