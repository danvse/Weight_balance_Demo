export type UserRole = 'patient' | 'prescriber';
export type TimeRange = 'days' | 'weeks' | 'months';
export type BreathStatus = 'none' | 'mild' | 'rest';

export interface MedicationItem {
  id: number;
  name: string;
  dose: string;
  frequency: string;
  isDiuretic: boolean;
  takenToday: boolean;
}

export interface PatientProfile {
  name: string;
  dob: string;
  email: string;
  baselineWeight: number;
  lastVisitDate: string;
  nextVisitDate: string;
  serialNumber: string;
  prescriberName: string;
  prescriberSpecialty: string;
  medications: MedicationItem[];
}

export interface SymptomCheck {
  shortnessOfBreath: BreathStatus;
  poorAppetite: boolean;
  hasSwelling: boolean;
  swellingLocations: string[];
  swellingOther: string;
  submittedAt: string | null;
}

export interface WeightEntry {
  id: number;
  dateLabel: string;
  fullDate: string;
  weight: number;
  syncTime: string;
}

export interface PeriodPoint {
  label: string;
  weight: number;
}

export interface ChartSeriesPoint {
  label: string;
  val: number;
  deltaPrev: number;
  deltaBase: number;
  syncTime: string;
}

export interface PrescriberUpdate {
  author: string;
  specialty: string;
  timestamp: string;
  message: string;
  acknowledged: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'system' | 'patient' | 'prescriber';
  text: string;
  time: string;
}

export interface ClinicalMetrics {
  latestWeight: number;
  syncTime: string;
  prevWeight: number;
  baseline: number;
  overnightDelta: number;
  baselineDelta: number;
  isConcerning: boolean;
}

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'alert' | 'info';
}
