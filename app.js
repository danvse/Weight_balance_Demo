/**
 * August Health / Dhrusti Mattress Scale RPM — Interactive Application Engine
 */

const STORAGE_KEY = 'dhrusti_rpm_demo_state_v2';

const DEFAULT_STATE = {
  isAuthenticated: false,
  userRole: 'patient', // 'patient' | 'prescriber'
  symptomGateCompleted: false,
  alertAcknowledged: false,
  currentPatientTab: 'home', // 'home' | 'chat' | 'profile'
  currentRange: 'days', // 'days' | 'weeks' | 'months'
  addMedOpen: false,

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
    shortnessOfBreath: 'none', // 'none' | 'mild' | 'rest'
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
    message: 'Robert, if your morning mattress scale reading rises more than 2 lbs above your 172.0 lb dry baseline or you notice ankle swelling, take an extra 20 mg Furosemide with breakfast and limit fluids to 1.5 L today.',
    acknowledged: false
  },

  // Most recent reading first (index 0)
  weightHistory: [
    { id: 7, dateLabel: 'Today', fullDate: 'Nov 24', weight: 174.6, syncTime: '6:15 AM' },
    { id: 6, dateLabel: 'Yesterday', fullDate: 'Nov 23', weight: 172.0, syncTime: '6:08 AM' },
    { id: 5, dateLabel: 'Nov 22', fullDate: 'Nov 22', weight: 172.2, syncTime: '6:22 AM' },
    { id: 4, dateLabel: 'Nov 21', fullDate: 'Nov 21', weight: 171.8, syncTime: '6:11 AM' },
    { id: 3, dateLabel: 'Nov 20', fullDate: 'Nov 20', weight: 172.1, syncTime: '6:19 AM' },
    { id: 2, dateLabel: 'Nov 19', fullDate: 'Nov 19', weight: 171.9, syncTime: '6:05 AM' },
    { id: 1, dateLabel: 'Nov 18', fullDate: 'Nov 18', weight: 172.0, syncTime: '6:14 AM' }
  ],

  weeklyHistory: [
    { label: 'Oct 19', weight: 172.8 },
    { label: 'Oct 26', weight: 173.4 },
    { label: 'Nov 2', weight: 172.5 },
    { label: 'Nov 9', weight: 172.1 },
    { label: 'Nov 16', weight: 171.9 },
    { label: 'This Wk', weight: 174.6 }
  ],

  monthlyHistory: [
    { label: 'Jun', weight: 171.5 },
    { label: 'Jul', weight: 172.0 },
    { label: 'Aug', weight: 171.8 },
    { label: 'Sep', weight: 172.2 },
    { label: 'Oct', weight: 172.0 },
    { label: 'Nov', weight: 174.6 }
  ],

  chatMessages: [
    {
      id: 'sys-1',
      sender: 'system',
      text: 'Mattress Scale recorded a morning weight of 174.6 lbs (+2.6 lbs overnight vs. 172.0 lb baseline).',
      time: '6:15 AM'
    },
    {
      id: 'doc-1',
      sender: 'prescriber',
      text: 'Good morning Robert. I saw the mattress scale alert showing a 2.6 lb overnight gain. How is your breathing when walking around the house?',
      time: '8:10 AM'
    },
    {
      id: 'pat-1',
      sender: 'patient',
      text: 'Good morning Dr. Miller. I felt slightly winded climbing the stairs and noticed my socks felt tight around my ankles.',
      time: '8:22 AM'
    },
    {
      id: 'doc-2',
      sender: 'prescriber',
      text: 'Thank you for letting me know. Let’s follow your diuretic step-up plan: take an extra 20 mg of Furosemide with breakfast, limit fluids to 1.5 liters today, and we will watch tomorrow morning’s mattress scale reading.',
      time: '8:26 AM'
    }
  ],
  unreadChatCount: 1
};

let AppState = loadState();
let activeLoginRole = 'patient';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore storage access errors
  }
  return structuredClone(DEFAULT_STATE);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (e) {
    // Ignore storage quota errors
  }
}

// ==============================================
// CLINICAL CALCULATIONS
// ==============================================
function getClinicalMetrics() {
  const latest = AppState.weightHistory[0];
  const prev = AppState.weightHistory[1] || { weight: AppState.patient.baselineWeight };
  const baseline = Number(AppState.patient.baselineWeight) || 172.0;

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
}

function formatDelta(val) {
  const fixed = Number(val).toFixed(1);
  return val > 0 ? `+${fixed} lbs` : `${fixed} lbs`;
}

function getDaysSinceVisit(dateStr) {
  if (!dateStr) return 'Not recorded';
  const visit = new Date(dateStr + 'T00:00:00');
  const refToday = new Date('2026-11-24T00:00:00');
  const diffDays = Math.round((refToday - visit) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays > 1) return `${diffDays} days ago`;
  return `In ${Math.abs(diffDays)} days`;
}

function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==============================================
// AUDIO ALERT & TOAST NOTIFICATIONS
// ==============================================
function playAlarmChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5-E5-G5 alert chime
    notes.forEach((freq, idx) => {
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
  } catch (e) {
    // Audio blocked by browser policy
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colors = {
    success: 'bg-august-forest text-white border-emerald-700',
    alert: 'bg-red-700 text-white border-red-400',
    info: 'bg-white text-august-dark border-august-border'
  };

  const iconHtml = type === 'alert'
    ? CustomIcons.alertSiren('w-4 h-4 shrink-0')
    : CustomIcons.checkSeal('w-4 h-4 shrink-0');

  const el = document.createElement('div');
  el.className = `toast-enter pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold max-w-sm ${colors[type] || colors.success}`;
  el.innerHTML = `${iconHtml}<span>${escapeHtml(message)}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'all 0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, 3200);
}

// ==============================================
// AUTHENTICATION HANDLERS
// ==============================================
function setAuthTab(tab) {
  const loginBox = document.getElementById('loginFormContainer');
  const signupBox = document.getElementById('signupFormContainer');
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabSignup = document.getElementById('tabBtnSignup');

  if (tab === 'login') {
    loginBox.classList.remove('hidden');
    signupBox.classList.add('hidden');
    tabLogin.className = 'pb-2.5 border-b-2 border-august-forest text-august-forest font-bold text-sm transition';
    tabSignup.className = 'pb-2.5 border-b-2 border-transparent text-august-warmGray hover:text-august-dark font-medium text-sm transition ml-5';
  } else {
    loginBox.classList.add('hidden');
    signupBox.classList.remove('hidden');
    tabSignup.className = 'pb-2.5 border-b-2 border-august-forest text-august-forest font-bold text-sm transition ml-5';
    tabLogin.className = 'pb-2.5 border-b-2 border-transparent text-august-warmGray hover:text-august-dark font-medium text-sm transition';
  }
}

function setLoginRole(role) {
  activeLoginRole = role;
  const patBtn = document.getElementById('loginRolePatient');
  const docBtn = document.getElementById('loginRolePrescriber');
  const emailInput = document.getElementById('loginEmail');

  if (role === 'patient') {
    patBtn.className = 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition';
    docBtn.className = 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition';
    emailInput.value = AppState.patient.email || 'robert.davis@patient.august.health';
  } else {
    docBtn.className = 'py-2.5 rounded-xl bg-white text-august-forest shadow-xs flex items-center justify-center gap-2 font-bold transition';
    patBtn.className = 'py-2.5 rounded-xl text-august-warmGray hover:text-august-dark flex items-center justify-center gap-2 font-medium transition';
    emailInput.value = 'dr.sarah.miller@cardiology.august.health';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  loginUser(activeLoginRole);
}

function quickLoginDemo(role) {
  setLoginRole(role);
  loginUser(role);
}

function handleSignupSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('signupFullName').value.trim();
  const dob = document.getElementById('signupDob').value;
  const email = document.getElementById('signupEmail').value.trim();
  const baseline = parseFloat(document.getElementById('signupBaseline').value) || 165.0;
  const serial = document.getElementById('signupSerial').value.trim() || 'MATT-9042-BLE';
  const diuretic = document.getElementById('signupDiuretic').value.trim();

  if (!fullName) {
    showToast('Please enter your full name.', 'alert');
    return;
  }

  AppState.patient.name = fullName;
  AppState.patient.dob = dob;
  AppState.patient.email = email;
  AppState.patient.baselineWeight = baseline;
  AppState.patient.serialNumber = serial;
  AppState.symptomGateCompleted = false;
  AppState.alertAcknowledged = false;

  // Adjust recent weight history around the new baseline so demo charts stay cohesive
  const offset = baseline - 172.0;
  AppState.weightHistory = AppState.weightHistory.map((item, idx) => ({
    ...item,
    weight: Number((item.weight + offset).toFixed(1))
  }));
  AppState.weeklyHistory = AppState.weeklyHistory.map(w => ({
    ...w,
    weight: Number((w.weight + offset).toFixed(1))
  }));
  AppState.monthlyHistory = AppState.monthlyHistory.map(m => ({
    ...m,
    weight: Number((m.weight + offset).toFixed(1))
  }));

  if (diuretic) {
    AppState.patient.medications.unshift({
      id: Date.now(),
      name: diuretic,
      dose: 'Daily Protocol',
      frequency: 'Once daily • Morning',
      isDiuretic: true,
      takenToday: false
    });
  }

  saveState();
  showToast(`Welcome, ${fullName}! Mattress scale ${serial} paired.`, 'success');
  loginUser('patient');
}

function loginUser(role) {
  AppState.isAuthenticated = true;
  AppState.userRole = role;
  saveState();
  renderApp();
}

function handleSignOut() {
  AppState.isAuthenticated = false;
  saveState();
  renderApp();
  showToast('Signed out securely.', 'info');
}

function resetEntireDemo() {
  localStorage.removeItem(STORAGE_KEY);
  AppState = structuredClone(DEFAULT_STATE);
  AppState.isAuthenticated = true;
  AppState.userRole = 'patient';
  AppState.symptomGateCompleted = false;
  saveState();
  renderApp();
  showToast('Demo data reset to fresh morning check-in.', 'info');
}

// ==============================================
// ROLE & NAVIGATION SWITCHING
// ==============================================
function selectRole(role) {
  AppState.userRole = role;
  saveState();
  renderApp();
}

function switchPatientTab(tabId) {
  AppState.currentPatientTab = tabId;
  if (tabId === 'chat') {
    AppState.unreadChatCount = 0;
  }
  saveState();
  renderApp();

  if (tabId === 'chat') {
    const stream = document.getElementById('chatMessageStream');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }
}

// ==============================================
// SYMPTOM SURVEY GATE
// ==============================================
function setSymptomBreath(val) {
  AppState.todaySymptoms.shortnessOfBreath = val;
  renderSymptomGate();
}

function setSymptomAppetite(val) {
  AppState.todaySymptoms.poorAppetite = val;
  renderSymptomGate();
}

function setSymptomSwelling(hasSwelling) {
  AppState.todaySymptoms.hasSwelling = hasSwelling;
  if (!hasSwelling) {
    AppState.todaySymptoms.swellingLocations = [];
    AppState.todaySymptoms.swellingOther = '';
  }
  renderSymptomGate();
}

function toggleSwellingLocation(loc) {
  const list = AppState.todaySymptoms.swellingLocations;
  const idx = list.indexOf(loc);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(loc);
  }
  renderSymptomGate();
}

function submitSymptomGate() {
  const s = AppState.todaySymptoms;
  const otherEl = document.getElementById('swellingOtherInput');
  if (otherEl) s.swellingOther = otherEl.value.trim();

  if (s.hasSwelling && s.swellingLocations.length === 0 && !s.swellingOther) {
    showToast('Please select or type where you notice swelling.', 'alert');
    return;
  }

  s.submittedAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  AppState.symptomGateCompleted = true;

  // Check if concerning weight change should fire alarm modal
  const metrics = getClinicalMetrics();
  if (metrics.isConcerning && !AppState.alertAcknowledged) {
    playAlarmChime();
  }

  saveState();
  renderApp();
  showToast('Morning symptom check logged for your care team.', 'success');
}

function resetSymptomGate() {
  AppState.symptomGateCompleted = false;
  saveState();
  renderApp();
}

// ==============================================
// WEIGHT SIMULATION & ALARM MODAL
// ==============================================
function toggleAlertSimulation() {
  const metrics = getClinicalMetrics();
  const prevWeight = AppState.weightHistory[1]?.weight || AppState.patient.baselineWeight;

  if (metrics.isConcerning) {
    // Switch to normal weight reading
    const normalWeight = Number((AppState.patient.baselineWeight + 0.1).toFixed(1));
    AppState.weightHistory[0].weight = normalWeight;
    AppState.weeklyHistory[AppState.weeklyHistory.length - 1].weight = normalWeight;
    AppState.monthlyHistory[AppState.monthlyHistory.length - 1].weight = normalWeight;
    AppState.alertAcknowledged = false;
    showToast(`Simulated normal morning reading: ${normalWeight} lbs`, 'success');
  } else {
    // Trigger >2 lbs spike
    const spikeWeight = Number((Math.max(prevWeight, AppState.patient.baselineWeight) + 2.6).toFixed(1));
    AppState.weightHistory[0].weight = spikeWeight;
    AppState.weeklyHistory[AppState.weeklyHistory.length - 1].weight = spikeWeight;
    AppState.monthlyHistory[AppState.monthlyHistory.length - 1].weight = spikeWeight;
    AppState.alertAcknowledged = false;
    playAlarmChime();
    showToast(`Alert triggered: Weight spiked to ${spikeWeight} lbs (>2 lbs)`, 'alert');
  }

  saveState();
  renderApp();
}

function acknowledgeWeightAlert() {
  AppState.alertAcknowledged = true;
  saveState();
  renderApp();
  showToast('Weight alert acknowledged. Remember to follow your fluid plan.', 'info');
}

function acknowledgePrescriberUpdate() {
  AppState.prescriberUpdate.acknowledged = true;
  saveState();
  renderApp();
  showToast('Care plan update marked as read.', 'success');
}

// ==============================================
// CHART RENDERER (DAYS / WEEKS / MONTHS)
// ==============================================
function setTimeRange(range) {
  AppState.currentRange = range;
  saveState();
  renderWeightChart();
  renderRangeTabs();
}

function renderRangeTabs() {
  ['days', 'weeks', 'months'].forEach(r => {
    const btn = document.getElementById(`rangeBtn${r.charAt(0).toUpperCase() + r.slice(1)}`);
    if (!btn) return;
    if (AppState.currentRange === r) {
      btn.className = 'flex-1 py-2 px-3 rounded-xl bg-white shadow-xs text-august-forest font-bold transition';
    } else {
      btn.className = 'flex-1 py-2 px-3 rounded-xl text-august-warmGray hover:text-august-dark font-semibold transition';
    }
  });

  const subLabels = {
    days: 'Daily Nocturnal Weight Trend (Past 7 Days)',
    weeks: 'Weekly Average Sleep Weights (Past 6 Weeks)',
    months: 'Monthly Sleep Weight Averages (Past 6 Months)'
  };
  const labelEl = document.getElementById('chartSubLabel');
  if (labelEl) labelEl.textContent = subLabels[AppState.currentRange];
}

function renderWeightChart() {
  const container = document.getElementById('chartContainer');
  if (!container) return;

  const baseline = Number(AppState.patient.baselineWeight);
  let series = [];

  if (AppState.currentRange === 'days') {
    series = AppState.weightHistory.slice().reverse().map((item, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1].weight : baseline;
      return {
        label: item.fullDate,
        val: item.weight,
        deltaPrev: Number((item.weight - prev).toFixed(1)),
        deltaBase: Number((item.weight - baseline).toFixed(1)),
        syncTime: item.syncTime
      };
    });
  } else if (AppState.currentRange === 'weeks') {
    series = AppState.weeklyHistory.map((item, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1].weight : baseline;
      return {
        label: item.label,
        val: item.weight,
        deltaPrev: Number((item.weight - prev).toFixed(1)),
        deltaBase: Number((item.weight - baseline).toFixed(1)),
        syncTime: 'Weekly Avg'
      };
    });
  } else {
    series = AppState.monthlyHistory.map((item, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1].weight : baseline;
      return {
        label: item.label,
        val: item.weight,
        deltaPrev: Number((item.weight - prev).toFixed(1)),
        deltaBase: Number((item.weight - baseline).toFixed(1)),
        syncTime: 'Monthly Avg'
      };
    });
  }

  // Update Screen-Time style summary stats
  const avg = (series.reduce((sum, d) => sum + d.val, 0) / series.length).toFixed(1);
  const latest = series[series.length - 1];
  const avgEl = document.getElementById('chartPeriodAvg');
  const vsBaseEl = document.getElementById('chartVsBaseline');
  if (avgEl) avgEl.textContent = `${avg} lbs`;
  if (vsBaseEl) {
    vsBaseEl.textContent = formatDelta(latest.deltaBase);
    vsBaseEl.className = latest.deltaBase > 2.0 ? 'text-sm font-bold text-red-600' : 'text-sm font-bold text-august-forest';
  }

  const allVals = series.map(d => d.val).concat([baseline]);
  const minVal = Math.min(...allVals) - 1.5;
  const maxVal = Math.max(...allVals) + 1.5;
  const valRange = maxVal - minVal || 1;

  const width = 620;
  const height = 215;
  const padL = 42;
  const padR = 72;
  const padT = 28;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const getX = (idx) => padL + (series.length > 1 ? (idx / (series.length - 1)) * plotW : plotW / 2);
  const getY = (val) => padT + plotH - ((val - minVal) / valRange) * plotH;

  const baselineY = getY(baseline);
  const polyPoints = series.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ');
  const metrics = getClinicalMetrics();
  const strokeColor = metrics.isConcerning ? '#DC2626' : '#1E3F30';

  // Horizontal Screen-Time style dashed guide lines
  const midVal = ((minVal + maxVal) / 2).toFixed(1);
  const guides = [
    { y: getY(maxVal - 0.3), text: (maxVal - 0.3).toFixed(0) },
    { y: getY(Number(midVal)), text: Number(midVal).toFixed(0) },
    { y: getY(minVal + 0.3), text: (minVal + 0.3).toFixed(0) }
  ];

  const barsAndNodes = series.map((d, i) => {
    const x = getX(i);
    const y = getY(d.val);
    const isHigh = d.deltaBase > 2.0 || d.deltaPrev > 2.0;
    const nodeColor = isHigh ? '#DC2626' : '#1E3F30';
    const barH = Math.max(8, (padT + plotH) - y);

    return `
      <g class="chart-node cursor-pointer" data-idx="${i}"
         onmouseenter="showChartTooltip(event, ${i})"
         onclick="showChartTooltip(event, ${i})"
         onmouseleave="hideChartTooltip()">
        <!-- Subtle Screen-Time Bar behind line -->
        <rect x="${x - 14}" y="${y}" width="28" height="${barH}" rx="7" fill="${nodeColor}" fill-opacity="${isHigh ? '0.18' : '0.09'}" />
        <!-- Invisible generous hit area for touch -->
        <rect x="${x - 24}" y="${padT}" width="48" height="${plotH + 20}" fill="transparent" />
        <!-- Data Dot -->
        <circle cx="${x}" cy="${y}" r="6" fill="${nodeColor}" stroke="#ffffff" stroke-width="2.5" />
        <!-- Value Label -->
        <text x="${x}" y="${y - 12}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${isHigh ? '#B91C1C' : '#16221D'}">${d.val.toFixed(1)}</text>
        <!-- X-axis Label -->
        <text x="${x}" y="${height - 8}" text-anchor="middle" font-size="11" font-weight="600" fill="#707E76">${d.label}</text>
      </g>
    `;
  }).join('');

  window.__currentChartSeries = series;

  container.innerHTML = `
    <div id="chartTooltip" class="chart-tooltip hidden absolute z-20 bg-august-dark text-white px-3 py-2 rounded-xl shadow-xl text-[11px] leading-snug min-w-[155px]"></div>
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible select-none">
      ${guides.map(g => `
        <line x1="${padL}" y1="${g.y}" x2="${width - padR}" y2="${g.y}" stroke="#E8E5DA" stroke-width="1" />
        <text x="${padL - 8}" y="${g.y + 4}" text-anchor="end" font-size="10" fill="#8A968E">${g.text}</text>
      `).join('')}

      <!-- Baseline Dry Weight Reference Line -->
      <line x1="${padL}" y1="${baselineY}" x2="${width - padR + 8}" y2="${baselineY}" stroke="#64748B" stroke-dasharray="4 4" stroke-width="1.8" />
      <text x="${width - padR + 12}" y="${baselineY + 4}" font-size="10.5" font-weight="700" fill="#475569">Base ${baseline.toFixed(1)}</text>

      <!-- Gradient Area -->
      <defs>
        <linearGradient id="rpmAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.22" />
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points="${getX(0)},${padT + plotH} ${polyPoints} ${getX(series.length - 1)},${padT + plotH}" fill="url(#rpmAreaGrad)" />

      <!-- Trend Line -->
      <polyline fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyPoints}" />

      ${barsAndNodes}
    </svg>
  `;
}

function showChartTooltip(evt, idx) {
  const tip = document.getElementById('chartTooltip');
  const container = document.getElementById('chartContainer');
  const item = window.__currentChartSeries?.[idx];
  if (!tip || !container || !item) return;

  const isHigh = item.deltaBase > 2.0 || item.deltaPrev > 2.0;
  tip.innerHTML = `
    <div class="font-bold text-white flex items-center justify-between gap-3">
      <span>${escapeHtml(item.label)}</span>
      <span class="${isHigh ? 'text-red-300' : 'text-emerald-300'}">${item.val.toFixed(1)} lbs</span>
    </div>
    <div class="text-slate-300 text-[10px] mt-0.5">Vs. Baseline: <b>${formatDelta(item.deltaBase)}</b></div>
    <div class="text-slate-300 text-[10px]">Step Change: <b>${formatDelta(item.deltaPrev)}</b> • ${escapeHtml(item.syncTime)}</div>
  `;
  tip.classList.remove('hidden');

  const rect = container.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const relX = Math.max(12, Math.min(rect.width - 170, (clientX - rect.left) - 75));
  tip.style.left = `${relX}px`;
  tip.style.top = `6px`;
}

function hideChartTooltip() {
  const tip = document.getElementById('chartTooltip');
  if (tip) tip.classList.add('hidden');
}

// ==============================================
// PROFILE & MEDICATIONS (INLINE INTERACTIONS)
// ==============================================
function toggleAddMedicationForm(open) {
  AppState.addMedOpen = open;
  const drawer = document.getElementById('addMedDrawer');
  if (drawer) drawer.classList.toggle('hidden', !open);
}

function handleAddMedicationSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newMedName').value.trim();
  const dose = document.getElementById('newMedDose').value.trim();
  const freq = document.getElementById('newMedFreq').value.trim();
  const isDiuretic = document.getElementById('newMedDiuretic').checked;

  if (!name || !dose) {
    showToast('Please enter medication name and dosage.', 'alert');
    return;
  }

  AppState.patient.medications.push({
    id: Date.now(),
    name,
    dose,
    frequency: freq || 'Once daily',
    isDiuretic,
    takenToday: false
  });

  document.getElementById('newMedName').value = '';
  document.getElementById('newMedDose').value = '';
  AppState.addMedOpen = false;
  saveState();
  renderApp();
  showToast(`${name} added to your medication list.`, 'success');
}

function toggleMedTaken(id) {
  const med = AppState.patient.medications.find(m => m.id === id);
  if (!med) return;
  med.takenToday = !med.takenToday;
  saveState();
  renderMedications();
  showToast(med.takenToday ? `Marked ${med.name} as taken today.` : `Unmarked ${med.name}.`, 'info');
}

function removeMedication(id) {
  const med = AppState.patient.medications.find(m => m.id === id);
  AppState.patient.medications = AppState.patient.medications.filter(m => m.id !== id);
  saveState();
  renderApp();
  if (med) showToast(`Removed ${med.name}.`, 'info');
}

function savePatientProfile(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('profNameInput').value.trim();
  const dob = document.getElementById('profDobInput').value;
  const baseline = parseFloat(document.getElementById('profBaselineInput').value);
  const lastVisit = document.getElementById('profLastVisitInput').value;

  if (!name || isNaN(baseline) || baseline < 50 || baseline > 500) {
    showToast('Please enter a valid name and baseline weight.', 'alert');
    return;
  }

  AppState.patient.name = name;
  AppState.patient.dob = dob;
  AppState.patient.baselineWeight = Number(baseline.toFixed(1));
  AppState.patient.lastVisitDate = lastVisit;
  AppState.alertAcknowledged = false;

  saveState();
  renderApp();
  showToast('Profile, baseline weight, and last visit saved.', 'success');
}

// ==============================================
// CHAT INTERACTIONS (PATIENT & PRESCRIBER)
// ==============================================
function sendQuickChat(text) {
  const input = document.getElementById('chatInputBox');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function shareVitalsInChat() {
  const metrics = getClinicalMetrics();
  const s = AppState.todaySymptoms;
  const swellText = s.hasSwelling
    ? `Swelling (${[...s.swellingLocations, s.swellingOther].filter(Boolean).join(', ')})`
    : 'No swelling';
  const breathMap = { none: 'No shortness of breath', mild: 'Shortness of breath with activity', rest: 'Shortness of breath at rest' };

  const summary = `📊 Shared Vitals Update: Mattress weight ${metrics.latestWeight.toFixed(1)} lbs (${formatDelta(metrics.baselineDelta)} vs baseline). Symptoms: ${breathMap[s.shortnessOfBreath]}, ${s.poorAppetite ? 'Poor appetite' : 'Normal appetite'}, ${swellText}.`;

  appendChatMessage('patient', summary, true);
}

function sendChatMessage() {
  const input = document.getElementById('chatInputBox');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendChatMessage('patient', text, true);
}

function appendChatMessage(sender, text, triggerAutoReply = false) {
  const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  AppState.chatMessages.push({
    id: 'msg-' + Date.now(),
    sender,
    text,
    time: now
  });
  saveState();
  renderChatStream();

  if (triggerAutoReply && sender === 'patient') {
    const typingEl = document.getElementById('chatTypingIndicator');
    if (typingEl) typingEl.classList.remove('hidden');
    const stream = document.getElementById('chatMessageStream');
    if (stream) stream.scrollTop = stream.scrollHeight;

    setTimeout(() => {
      if (typingEl) typingEl.classList.add('hidden');
      const metrics = getClinicalMetrics();
      const lower = text.toLowerCase();
      let reply = 'Thanks for sharing that update. I have noted it in your chart—please keep monitoring your nocturnal mattress weight tomorrow morning.';

      if (lower.includes('furosemide') || lower.includes('lasix') || lower.includes('pill') || lower.includes('diuretic')) {
        reply = 'Yes, since your weight is above your 2 lb threshold, please follow your morning step-up dose as listed in your Care Update and keep fluids under 1.5 L today.';
      } else if (lower.includes('swelling') || lower.includes('breath') || lower.includes('chest')) {
        reply = 'I’m reviewing your symptom report right now. If your shortness of breath worsens at rest, please call our triage nurse line immediately or seek urgent care.';
      } else if (metrics.isConcerning) {
        reply = `I received your message along with today’s ${metrics.latestWeight.toFixed(1)} lb mattress reading. Let’s check tomorrow morning’s reading closely—I’ll also call if the weight doesn’t drop by 1 lb.`;
      }

      AppState.chatMessages.push({
        id: 'doc-' + Date.now(),
        sender: 'prescriber',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      });
      saveState();
      renderChatStream();
    }, 1250);
  }
}

// Prescriber EHR Actions
function submitPrescriberOrder(e) {
  e.preventDefault();
  const input = document.getElementById('prescriberNoteInput');
  const note = input?.value.trim();
  if (!note) {
    showToast('Please write an update for the patient.', 'alert');
    return;
  }

  AppState.prescriberUpdate = {
    author: AppState.patient.prescriberName,
    specialty: AppState.patient.prescriberSpecialty,
    timestamp: 'Just now',
    message: note,
    acknowledged: false
  };
  AppState.chatMessages.push({
    id: 'doc-order-' + Date.now(),
    sender: 'prescriber',
    text: `📋 New Care Update Posted: "${note}"`,
    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  });
  AppState.unreadChatCount += 1;
  input.value = '';
  saveState();
  renderApp();
  showToast('Update pushed live to Patient Home Dashboard & Chat.', 'success');
}

// ==============================================
// RENDERING ORCHESTRATION
// ==============================================
function renderApp() {
  const authScreen = document.getElementById('authScreen');
  const mainWrapper = document.getElementById('mainAppWrapper');

  if (!AppState.isAuthenticated) {
    authScreen.classList.remove('hidden');
    mainWrapper.classList.add('hidden');
    document.body.classList.remove('dashboard-alert-red');
    return;
  }

  authScreen.classList.add('hidden');
  mainWrapper.classList.remove('hidden');

  // Update Header Identity
  const initials = AppState.userRole === 'prescriber'
    ? 'SM'
    : AppState.patient.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('userAvatarPill').textContent = initials || 'PT';
  document.getElementById('navSensorSerial').textContent = `Mattress Sensor Online (${AppState.patient.serialNumber})`;

  // Role toggle buttons
  const patBtn = document.getElementById('navRolePatient');
  const docBtn = document.getElementById('navRoleDoctor');
  const patientView = document.getElementById('patientViewRoot');
  const prescriberView = document.getElementById('prescriberViewRoot');
  const mobileBottomNav = document.getElementById('mobileBottomNav');

  if (AppState.userRole === 'prescriber') {
    patientView.classList.add('hidden');
    prescriberView.classList.remove('hidden');
    mobileBottomNav.classList.add('hidden');
    document.getElementById('symptomGateModal').classList.add('hidden');
    document.getElementById('weightAlarmModal').classList.add('hidden');
    document.body.classList.remove('dashboard-alert-red');

    docBtn.className = 'px-3 py-1.5 rounded-lg bg-august-forest text-white font-bold transition shadow-xs flex items-center gap-1.5';
    patBtn.className = 'px-3 py-1.5 rounded-lg text-august-warmGray hover:text-august-dark transition flex items-center gap-1.5';
    renderPrescriberView();
    return;
  }

  // Patient View
  prescriberView.classList.add('hidden');
  patientView.classList.remove('hidden');
  mobileBottomNav.classList.remove('hidden');
  patBtn.className = 'px-3 py-1.5 rounded-lg bg-august-forest text-white font-bold transition shadow-xs flex items-center gap-1.5';
  docBtn.className = 'px-3 py-1.5 rounded-lg text-august-warmGray hover:text-august-dark transition flex items-center gap-1.5';

  // Symptom Gate Check (before accessing dashboard)
  const symptomModal = document.getElementById('symptomGateModal');
  if (!AppState.symptomGateCompleted) {
    symptomModal.classList.remove('hidden');
    renderSymptomGate();
  } else {
    symptomModal.classList.add('hidden');
  }

  // Evaluate >2 lbs Red Alert State
  const metrics = getClinicalMetrics();
  const simBtn = document.getElementById('simAlertBtn');
  const simBtnText = document.getElementById('simAlertText');

  if (metrics.isConcerning) {
    document.body.classList.add('dashboard-alert-red');
    if (simBtnText) simBtnText.textContent = 'Simulate Normal Day';
    if (simBtn) simBtn.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-xs';
  } else {
    document.body.classList.remove('dashboard-alert-red');
    if (simBtnText) simBtnText.textContent = 'Simulate >2 lbs Spike';
    if (simBtn) simBtn.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-xs';
  }

  // Urgent Alarm Modal when gate completed and alert not yet acknowledged
  const alarmModal = document.getElementById('weightAlarmModal');
  if (AppState.symptomGateCompleted && metrics.isConcerning && !AppState.alertAcknowledged && AppState.currentPatientTab === 'home') {
    alarmModal.classList.remove('hidden');
    document.getElementById('alarmModalWeight').textContent = `${metrics.latestWeight.toFixed(1)} lbs`;
    document.getElementById('alarmModalDelta').textContent = `${formatDelta(Math.max(metrics.overnightDelta, metrics.baselineDelta))}`;
  } else {
    alarmModal.classList.add('hidden');
  }

  renderPatientNavigation();
  renderHomeDashboard(metrics);
  renderChatStream();
  renderProfilePage();
}

function renderSymptomGate() {
  const s = AppState.todaySymptoms;

  // Shortness of breath buttons
  document.querySelectorAll('.breath-opt').forEach(btn => {
    const active = btn.dataset.val === s.shortnessOfBreath;
    btn.className = `breath-opt flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
      active
        ? 'border-august-forest bg-august-forest text-white shadow-sm'
        : 'border-august-border bg-white text-august-dark hover:border-august-forest/60'
    }`;
  });

  // Appetite buttons
  document.querySelectorAll('.appetite-opt').forEach(btn => {
    const active = (btn.dataset.val === 'yes') === s.poorAppetite;
    btn.className = `appetite-opt flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
      active
        ? 'border-august-forest bg-august-forest text-white shadow-sm'
        : 'border-august-border bg-white text-august-dark hover:border-august-forest/60'
    }`;
  });

  // Swelling Yes/No
  document.querySelectorAll('.swelling-opt').forEach(btn => {
    const active = (btn.dataset.val === 'yes') === s.hasSwelling;
    btn.className = `swelling-opt flex items-center justify-center gap-2 p-3.5 rounded-2xl border font-bold text-xs transition ${
      active
        ? 'border-august-forest bg-august-forest text-white shadow-sm'
        : 'border-august-border bg-white text-august-dark hover:border-august-forest/60'
    }`;
  });

  // Swelling Locations container
  const locBox = document.getElementById('swellingLocationsContainer');
  if (locBox) locBox.classList.toggle('hidden', !s.hasSwelling);

  document.querySelectorAll('.swelling-loc-btn').forEach(btn => {
    const active = s.swellingLocations.includes(btn.dataset.loc);
    btn.className = `swelling-loc-btn flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition text-left ${
      active
        ? 'border-august-forest bg-august-sage text-august-forest shadow-xs'
        : 'border-august-border bg-white text-august-dark hover:border-august-forest/50'
    }`;
  });
}

function renderPatientNavigation() {
  const tabs = ['home', 'chat', 'profile'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  document.getElementById('contentHome').classList.toggle('hidden', AppState.currentPatientTab !== 'home');
  document.getElementById('contentChat').classList.toggle('hidden', AppState.currentPatientTab !== 'chat');
  document.getElementById('contentProfile').classList.toggle('hidden', AppState.currentPatientTab !== 'profile');

  tabs.forEach(t => {
    const webBtn = document.getElementById(`tabWeb${cap(t)}`);
    const mobBtn = document.getElementById(`tabMob${cap(t)}`);
    const isActive = AppState.currentPatientTab === t;

    if (webBtn) {
      webBtn.className = isActive
        ? 'px-4 py-2 rounded-xl bg-white text-august-forest shadow-xs flex items-center gap-2 font-bold transition'
        : 'px-4 py-2 rounded-xl text-august-warmGray hover:text-august-dark flex items-center gap-2 font-semibold transition';
    }
    if (mobBtn) {
      mobBtn.className = isActive
        ? 'flex-1 flex flex-col items-center justify-center gap-1 py-1.5 text-august-forest font-bold relative transition'
        : 'flex-1 flex flex-col items-center justify-center gap-1 py-1.5 text-august-warmGray font-medium relative transition';
    }
  });

  // Unread chat badge
  const showBadge = AppState.unreadChatCount > 0 && AppState.currentPatientTab !== 'chat';
  ['webChatBadge', 'mobChatBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !showBadge);
  });
}

function renderHomeDashboard(metrics) {
  document.getElementById('patientGreeting').textContent = AppState.patient.name;

  // Today's symptom summary pill
  const s = AppState.todaySymptoms;
  const breathMap = { none: 'Breathing normal', mild: 'SOB w/ activity', rest: 'SOB at rest' };
  const swellTxt = s.hasSwelling
    ? `Swelling: ${[...s.swellingLocations, s.swellingOther].filter(Boolean).join(', ')}`
    : 'No swelling';
  document.getElementById('symptomSummaryPill').textContent = AppState.symptomGateCompleted
    ? `Today's Check-in: ${breathMap[s.shortnessOfBreath]} • ${s.poorAppetite ? 'Poor appetite' : 'Normal appetite'} • ${swellTxt}`
    : 'Daily symptom check pending';

  // Alert Banner
  const banner = document.getElementById('criticalAlertBanner');
  const heroCard = document.getElementById('mainWeightHeroCard');
  if (metrics.isConcerning) {
    banner.classList.remove('hidden');
    heroCard.classList.add('alert-card-highlight');
    document.getElementById('alertDeltaText').textContent = formatDelta(Math.max(metrics.overnightDelta, metrics.baselineDelta));
  } else {
    banner.classList.add('hidden');
    heroCard.classList.remove('alert-card-highlight');
  }

  // Hero Metric Display
  document.getElementById('heroWeightVal').textContent = metrics.latestWeight.toFixed(1);
  document.getElementById('heroBaselineVal').textContent = `${metrics.baseline.toFixed(1)} lbs`;
  document.getElementById('heroSyncTime').textContent = `Mattress sync: Today ${metrics.syncTime}`;

  const badge = document.getElementById('heroDeltaBadge');
  const deltaText = document.getElementById('heroDeltaVal');
  if (metrics.isConcerning) {
    badge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1.5 border border-red-200';
    deltaText.textContent = `${formatDelta(metrics.overnightDelta)} overnight • Concerning (>2 lbs)`;
  } else {
    badge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-august-sage text-august-forest flex items-center gap-1.5 border border-emerald-200';
    deltaText.textContent = `${formatDelta(metrics.overnightDelta)} overnight • Stable`;
  }

  renderRangeTabs();
  renderWeightChart();
  renderWeightTable(metrics);

  // Block 2: Prescriber Care Update
  const upd = AppState.prescriberUpdate;
  document.getElementById('prescriberUpdateAuthor').textContent = `${upd.author} • ${upd.specialty}`;
  document.getElementById('prescriberUpdateTime').textContent = upd.timestamp;
  document.getElementById('prescriberUpdateContent').textContent = `"${upd.message}"`;
  const ackBtn = document.getElementById('ackUpdateBtn');
  if (ackBtn) {
    ackBtn.innerHTML = upd.acknowledged
      ? `${CustomIcons.checkSeal('w-3.5 h-3.5')}<span>Acknowledged</span>`
      : `${CustomIcons.checkSeal('w-3.5 h-3.5')}<span>Mark as Read</span>`;
    ackBtn.className = upd.acknowledged
      ? 'px-3 py-1.5 rounded-xl bg-august-sage text-august-forest text-xs font-bold flex items-center gap-1.5'
      : 'px-3 py-1.5 rounded-xl bg-august-forest hover:bg-august-forestHover text-white text-xs font-bold flex items-center gap-1.5 transition';
  }

  // Block 3: Last Visit to Prescriber
  document.getElementById('cardLastVisitDate').textContent = formatFriendlyDate(AppState.patient.lastVisitDate);
  document.getElementById('cardDaysSinceVisit').textContent = getDaysSinceVisit(AppState.patient.lastVisitDate);
  document.getElementById('cardNextVisitDate').textContent = formatFriendlyDate(AppState.patient.nextVisitDate);

  // Quick Diuretic Summary on Home
  const homeMedsEl = document.getElementById('homeDiureticsPreview');
  if (homeMedsEl) {
    const diuretics = AppState.patient.medications.filter(m => m.isDiuretic);
    homeMedsEl.innerHTML = diuretics.length
      ? diuretics.map(m => `
        <div class="p-3 bg-august-ivory rounded-2xl border border-august-border flex items-center justify-between">
          <div>
            <div class="font-bold text-august-dark text-xs">${escapeHtml(m.name)}</div>
            <div class="text-[11px] text-august-warmGray">${escapeHtml(m.dose)} • ${escapeHtml(m.frequency)}</div>
          </div>
          <button onclick="toggleMedTaken(${m.id})" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
            m.takenToday ? 'bg-august-sage text-august-forest' : 'bg-white border border-august-border text-august-warmGray hover:border-august-forest'
          }">
            ${m.takenToday ? '✓ Taken today' : 'Mark taken'}
          </button>
        </div>
      `).join('')
      : `<div class="text-xs text-august-warmGray py-2">No diuretics listed. Add medications in Profile.</div>`;
  }
}

function renderWeightTable(metrics) {
  const tbody = document.getElementById('weightTableBody');
  if (!tbody) return;

  const rows = AppState.weightHistory.slice(0, 5);
  tbody.innerHTML = rows.map((row, idx) => {
    const nextOlder = AppState.weightHistory[idx + 1];
    const delta = nextOlder ? Number((row.weight - nextOlder.weight).toFixed(1)) : 0.0;
    const vsBaseline = Number((row.weight - metrics.baseline).toFixed(1));
    const isConcerning = delta > 2.0 || (idx === 0 && vsBaseline > 2.0);

    const badge = isConcerning
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">${CustomIcons.alertSiren('w-3 h-3')} Concerning</span>`
      : (delta > 0.5
        ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Watch</span>`
        : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-august-sage text-august-forest">${CustomIcons.checkSeal('w-3 h-3')} Stable</span>`);

    return `
      <tr class="${isConcerning ? 'bg-red-50/70' : 'hover:bg-august-ivory/60'} transition">
        <td class="py-3 px-4">
          <div class="font-bold text-august-dark text-xs sm:text-sm">${escapeHtml(row.dateLabel)}</div>
          <div class="text-[10px] text-august-warmGray">${escapeHtml(row.syncTime)}</div>
        </td>
        <td class="py-3 px-3 font-serif font-bold text-base text-august-dark">${row.weight.toFixed(1)} lbs</td>
        <td class="py-3 px-3 font-bold text-xs sm:text-sm ${isConcerning ? 'text-red-700' : 'text-august-dark'}">${formatDelta(delta)}</td>
        <td class="py-3 px-4 text-right">${badge}</td>
      </tr>
    `;
  }).join('');
}

function renderChatStream() {
  const stream = document.getElementById('chatMessageStream');
  if (!stream) return;

  stream.innerHTML = AppState.chatMessages.map(m => {
    if (m.sender === 'system') {
      return `
        <div class="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-august-dark max-w-xl mx-auto shadow-xs flex items-start gap-2.5">
          <div class="text-red-600 shrink-0 mt-0.5">${CustomIcons.alertSiren('w-4 h-4')}</div>
          <div>
            <div class="font-bold text-red-700">Automated Mattress Scale Alert • ${escapeHtml(m.time)}</div>
            <p class="mt-0.5 text-august-dark leading-relaxed">${escapeHtml(m.text)}</p>
          </div>
        </div>`;
    }
    if (m.sender === 'patient') {
      return `
        <div class="flex items-end justify-end gap-2.5 ml-auto max-w-xl">
          <div class="bg-august-forest text-white px-4 py-3 rounded-2xl rounded-br-xs shadow-xs text-xs sm:text-sm space-y-1">
            <p class="leading-relaxed">${escapeHtml(m.text)}</p>
            <span class="text-[10px] text-emerald-200 block text-right">${escapeHtml(m.time)}</span>
          </div>
        </div>`;
    }
    return `
      <div class="flex items-end gap-2.5 max-w-xl">
        <div class="w-8 h-8 rounded-xl bg-august-forest text-white flex items-center justify-center font-serif text-xs font-bold shrink-0">SM</div>
        <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-xs shadow-xs border border-august-border text-xs sm:text-sm text-august-dark space-y-1">
          <p class="leading-relaxed">${escapeHtml(m.text)}</p>
          <span class="text-[10px] text-august-warmGray block text-right">${escapeHtml(m.time)}</span>
        </div>
      </div>`;
  }).join('');
}

function renderProfilePage() {
  const nameEl = document.getElementById('profNameInput');
  const dobEl = document.getElementById('profDobInput');
  const baseEl = document.getElementById('profBaselineInput');
  const visitEl = document.getElementById('profLastVisitInput');

  if (nameEl && document.activeElement !== nameEl) nameEl.value = AppState.patient.name;
  if (dobEl && document.activeElement !== dobEl) dobEl.value = AppState.patient.dob;
  if (baseEl && document.activeElement !== baseEl) baseEl.value = AppState.patient.baselineWeight;
  if (visitEl && document.activeElement !== visitEl) visitEl.value = AppState.patient.lastVisitDate;

  renderMedications();
}

function renderMedications() {
  const container = document.getElementById('medicationListContainer');
  if (!container) return;

  container.innerHTML = AppState.patient.medications.map(med => `
    <div class="p-4 rounded-2xl bg-august-ivory border border-august-border flex flex-col justify-between gap-3">
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-1">
          <div class="font-bold text-august-dark text-sm flex flex-wrap items-center gap-1.5">
            <span>${escapeHtml(med.name)}</span>
            ${med.isDiuretic ? '<span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">Diuretic</span>' : ''}
          </div>
          <div class="text-xs text-august-warmGray">${escapeHtml(med.dose)} • ${escapeHtml(med.frequency)}</div>
        </div>
        <button onclick="removeMedication(${med.id})" title="Remove medication" class="text-august-warmGray hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition">
          ${CustomIcons.trash('w-4 h-4')}
        </button>
      </div>
      <div class="pt-2 border-t border-august-border/70 flex items-center justify-between">
        <span class="text-[11px] text-august-warmGray">Today's Dose</span>
        <button onclick="toggleMedTaken(${med.id})" class="px-3 py-1 rounded-full text-[11px] font-bold transition ${
          med.takenToday ? 'bg-august-sage text-august-forest' : 'bg-white border border-august-border text-august-warmGray hover:border-august-forest'
        }">
          ${med.takenToday ? '✓ Taken today' : 'Mark as taken'}
        </button>
      </div>
    </div>
  `).join('');
}

function renderPrescriberView() {
  const metrics = getClinicalMetrics();
  const s = AppState.todaySymptoms;
  const breathMap = { none: 'No SOB', mild: 'SOB w/ exertion', rest: 'SOB at rest' };
  const swellTxt = s.hasSwelling
    ? `Edema (${[...s.swellingLocations, s.swellingOther].filter(Boolean).join(', ')})`
    : 'No edema';
  const symSummary = AppState.symptomGateCompleted
    ? `${breathMap[s.shortnessOfBreath]} • ${s.poorAppetite ? 'Poor appetite' : 'Normal appetite'} • ${swellTxt}`
    : 'Awaiting morning check-in';

  const rowName = document.getElementById('ehrPatientName');
  const rowWeight = document.getElementById('ehrPatientWeight');
  const rowDelta = document.getElementById('ehrPatientDelta');
  const rowSym = document.getElementById('ehrPatientSymptoms');
  const rowMed = document.getElementById('ehrPatientDiuretic');
  const rowTr = document.getElementById('ehrPrimaryPatientRow');
  const alertCountBadge = document.getElementById('ehrAlertCountBadge');

  if (rowName) rowName.textContent = AppState.patient.name;
  if (rowWeight) rowWeight.textContent = `${metrics.latestWeight.toFixed(1)} lbs`;
  if (rowDelta) {
    rowDelta.textContent = `${formatDelta(metrics.overnightDelta)} ${metrics.isConcerning ? '(High >2 lbs)' : '(Stable)'}`;
    rowDelta.className = metrics.isConcerning
      ? 'px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
      : 'px-2.5 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs';
  }
  if (rowSym) {
    rowSym.textContent = symSummary;
    rowSym.className = (s.shortnessOfBreath !== 'none' || s.hasSwelling || metrics.isConcerning)
      ? 'py-3.5 px-3 text-red-700 font-semibold'
      : 'py-3.5 px-3 text-august-warmGray';
  }
  if (rowMed) {
    const primaryDiuretic = AppState.patient.medications.find(m => m.isDiuretic);
    rowMed.textContent = primaryDiuretic ? `${primaryDiuretic.name} ${primaryDiuretic.dose}` : 'None active';
  }
  if (rowTr) {
    rowTr.className = metrics.isConcerning ? 'bg-red-50/80 hover:bg-red-50 transition' : 'hover:bg-august-ivory/60 transition';
  }
  if (alertCountBadge) {
    alertCountBadge.textContent = metrics.isConcerning ? '1 Critical Alert (>2 lbs)' : '0 Critical Alerts';
    alertCountBadge.className = metrics.isConcerning
      ? 'px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs'
      : 'px-3 py-1 rounded-full bg-august-sage text-august-forest font-bold text-xs';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==============================================
// INIT & ICON INJECTION
// ==============================================
function injectCustomIcons() {
  document.querySelectorAll('[data-cicon]').forEach(el => {
    const name = el.getAttribute('data-cicon');
    const cls = el.getAttribute('data-cicon-class') || 'w-5 h-5';
    if (CustomIcons[name]) {
      el.innerHTML = CustomIcons[name](cls);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  injectCustomIcons();
  const chatInput = document.getElementById('chatInputBox');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }
  renderApp();
});
