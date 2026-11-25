import { Injectable, computed, effect, signal } from '@angular/core';
import {
  BreathStatus,
  ChatMessage,
  ClinicalMetrics,
  MedicationItem,
  PatientProfile,
  PeriodPoint,
  PrescriberUpdate,
  SymptomCheck,
  SymptomSeverity,
  TimeRange,
  ToastItem,
  UserRole,
  WeightEntry
} from '../models/care.models';

const STORAGE_KEY = 'august_care_angular_rpm_v3';

interface PersistedState {
  isAuthenticated: boolean;
  userRole: UserRole;
  symptomGateCompleted: boolean;
  alertAcknowledged: boolean;
  currentRange: TimeRange;
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
  patient: {
    name: 'Robert Davis',
    dob: '1958-04-14',
    email: 'robert.davis@patient.august.health',
    baselineWeight: 172.0,
    lastVisitDate: '2026-11-12',
    nextVisitDate: '2026-12-15',
    serialNumber: 'MATT-8492-BLE',
    prescriberName: 'Dr. Sarah Miller, MD',
    prescriberSpecialty: 'Cardiology Clinic',
    medications: [
      { id: 1, name: 'Furosemide (Lasix)', dose: '40 mg', frequency: 'Once daily • Morning', isDiuretic: true, takenToday: true },
      { id: 2, name: 'Spironolactone', dose: '25 mg', frequency: 'Once daily • Morning', isDiuretic: true, takenToday: true },
      { id: 3, name: 'Carvedilol', dose: '12.5 mg', frequency: 'Twice daily • Morning & Evening', isDiuretic: false, takenToday: false }
    ]
  },
  todaySymptoms: {
    shortnessOfBreath: 'none',
    poorAppetite: false,
    hasSwelling: false,
    swellingLocations: [],
    swellingOther: '',
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
    { id: 7, dateLabel: 'Today', fullDate: 'Nov 24', weight: 172.1, syncTime: '6:15 AM' },
    {
      id: 6,
      dateLabel: 'Yesterday',
      fullDate: 'Nov 23',
      weight: 172.0,
      syncTime: '6:08 AM',
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:14 AM' }
    },
    {
      id: 5,
      dateLabel: 'Nov 22',
      fullDate: 'Nov 22',
      weight: 172.2,
      syncTime: '6:22 AM',
      symptoms: { shortnessOfBreath: 'none', poorAppetite: true, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:30 AM' }
    },
    {
      id: 4,
      dateLabel: 'Nov 21',
      fullDate: 'Nov 21',
      weight: 171.8,
      syncTime: '6:11 AM',
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:20 AM' }
    },
    {
      id: 3,
      dateLabel: 'Nov 20',
      fullDate: 'Nov 20',
      weight: 172.1,
      syncTime: '6:19 AM',
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:25 AM' }
    },
    {
      id: 2,
      dateLabel: 'Nov 19',
      fullDate: 'Nov 19',
      weight: 171.9,
      syncTime: '6:05 AM',
      symptoms: { shortnessOfBreath: 'none', poorAppetite: false, hasSwelling: false, swellingLocations: [], swellingOther: '', submittedAt: '6:12 AM' }
    },
    {
      id: 1,
      dateLabel: 'Nov 18',
      fullDate: 'Nov 18',
      weight: 172.0,
      syncTime: '6:14 AM',
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
      rows.map((r, i) => (i === 0 ? { ...r, symptoms: submitted } : r))
    );
    this.symptomGateCompleted.set(true);

    const severity = this.getSymptomSeverity(submitted);
    const chips = this.formatSymptomChips(submitted);

    // Automatically log mild or severe morning symptoms to Prescriber Chat
    if (severity !== 'clear') {
      const metrics = this.clinicalMetrics();
      const cardText = `Morning Health Check (${timeStr}): ${chips.join(', ')} • Mattress weight ${metrics.latestWeight.toFixed(1)} lbs (${this.formatDelta(metrics.baselineDelta)} vs baseline).`;
      this.chatMessages.update(list => {
        const filtered = list.filter(m => m.id !== 'sys-symptom-today');
        return [
          ...filtered,
          { id: 'sys-symptom-today', sender: 'system', text: cardText, time: timeStr }
        ];
      });
      if (severity === 'severe') {
        this.unreadChatCount.update(c => c + 1);
      }
    } else {
      this.chatMessages.update(list => list.filter(m => m.id !== 'sys-symptom-today'));
    }

    if ((this.clinicalMetrics().isConcerning && !this.alertAcknowledged()) || submitted.shortnessOfBreath === 'rest') {
      this.playAlarmChime();
    }

    if (submitted.shortnessOfBreath === 'rest') {
      this.showToast('Urgent: Breathing trouble at rest logged. Please contact Dr. Miller.', 'alert');
    } else if (severity !== 'clear') {
      this.showToast('Morning symptoms logged and shared with Dr. Miller in Chat.', 'info');
    } else {
      this.showToast('Morning health check logged — looking good today!', 'success');
    }
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

  updateProfile(patch: Partial<Pick<PatientProfile, 'name' | 'dob' | 'baselineWeight' | 'lastVisitDate'>>): void {
    this.patient.update(p => ({ ...p, ...patch }));
    this.alertAcknowledged.set(false);
    this.showToast('Profile, baseline weight, and last visit saved.', 'success');
  }

  addMedication(med: Omit<MedicationItem, 'id' | 'takenToday'>): void {
    this.patient.update(p => ({
      ...p,
      medications: [...p.medications, { ...med, id: Date.now(), takenToday: false }]
    }));
    this.showToast(`${med.name} added to your medication list.`, 'success');
  }

  toggleMedicationTaken(id: number): void {
    let targetName = '';
    let nextState = false;
    this.patient.update(p => ({
      ...p,
      medications: p.medications.map(m => {
        if (m.id === id) {
          targetName = m.name;
          nextState = !m.takenToday;
          return { ...m, takenToday: nextState };
        }
        return m;
      })
    }));
    if (targetName) {
      this.showToast(nextState ? `Marked ${targetName} as taken today.` : `Unmarked ${targetName}.`, 'info');
    }
  }

  removeMedication(id: number): void {
    const found = this.patient().medications.find(m => m.id === id);
    this.patient.update(p => ({
      ...p,
      medications: p.medications.filter(m => m.id !== id)
    }));
    if (found) this.showToast(`Removed ${found.name}.`, 'info');
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
    const summary = `📊 Shared Vitals Update: Mattress weight ${m.latestWeight.toFixed(1)} lbs (${this.formatDelta(m.baselineDelta)} vs baseline). Symptoms: ${this.symptomSummary()}.`;
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
