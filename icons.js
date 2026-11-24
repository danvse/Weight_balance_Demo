/**
 * Custom Bespoke SVG Icon Library for Dhrusti / August Care Mattress RPM
 * Designed with warm duotone medical geometry for high legibility and low cognitive load.
 */

const CustomIcons = {
  // Brand Emblem: Mattress wave + Heart pulse inside shield
  brandLogo: (cls = 'w-6 h-6') => `
    <svg viewBox="0 0 32 32" fill="none" class="${cls}" aria-hidden="true">
      <path d="M16 3L5.5 7.5V15.2C5.5 22.1 10 27.9 16 29.5C22 27.9 26.5 22.1 26.5 15.2V7.5L16 3Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M9.5 16.5H12.5L14.5 12L17.5 20.5L19.5 16.5H22.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Smart Mattress Scale Device: Bed silhouette with load-sensor telemetry waves
  mattressScale: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <rect x="2.5" y="10" width="19" height="6" rx="2" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8"/>
      <path d="M4.5 10V7.5C4.5 6.4 5.4 5.5 6.5 5.5H10C10.8 5.5 11.5 6.2 11.5 7V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5 16V18.5M19 16V18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 19.5C10.8 20.8 13.2 20.8 15 19.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="17.5" cy="6.5" r="2" fill="currentColor"/>
    </svg>`,

  // Lungs / Shortness of Breath custom medical icon
  lungs: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M12 4V11M12 11L9 13.5M12 11L15 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.5 8.5C6.5 8.5 4 11.8 4 15.8C4 18.1 5.3 19.5 7.2 19.5C8.9 19.5 10 18.3 10 16.5V10.5C10 9.4 9.8 8.5 9.5 8.5Z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M14.5 8.5C17.5 8.5 20 11.8 20 15.8C20 18.1 18.7 19.5 16.8 19.5C15.1 19.5 14 18.3 14 16.5V10.5C14 9.4 14.2 8.5 14.5 8.5Z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>`,

  // Poor Appetite / Dining Bowl custom icon
  appetite: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M4 12.5H20C20 16.9 16.4 20 12 20C7.6 20 4 16.9 4 12.5Z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8.5 20H15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 8.5C9 7.2 10 6.5 10 5M12.5 8.5C12.5 7.2 13.5 6.5 13.5 5M16 8.5C16 7.2 17 6.5 17 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,

  // Swelling / Edema Fluid Droplet & Ripple custom icon
  edema: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M12 3.5C12 3.5 6.5 10 6.5 14.2C6.5 17.3 9 19.8 12 19.8C15 19.8 17.5 17.3 17.5 14.2C17.5 10 12 3.5 12 3.5Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.5 14.5C9.5 15.9 10.6 17 12 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,

  // Body Region: Feet / Ankles
  bodyFoot: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M9 4V13.5C9 14.5 8.2 15.5 7 16.2L5.2 17.2C4.2 17.8 4 19 4.8 19.7C5.4 20.2 6.5 20.3 8 20.3H17.5C18.9 20.3 19.8 19.3 19.5 18C19.2 16.8 18 16.2 16.5 15.8L14 15V4" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="11.5" cy="14.5" r="1.3" fill="currentColor"/>
    </svg>`,

  // Body Region: Lower Legs
  bodyLeg: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M8.5 3.5L7.5 11.5C7.2 13.8 8 16 9 18L9.5 20.5H14.5L15.2 16.5C16.2 13.8 16.5 10.5 15.5 3.5" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.5 12H15.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>`,

  // Body Region: Abdomen
  bodyAbdomen: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M7.5 4.5C7.5 7.5 6 9.5 6 13.5C6 17.2 8.7 19.5 12 19.5C15.3 19.5 18 17.2 18 13.5C18 9.5 16.5 7.5 16.5 4.5" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="14" r="1.2" fill="currentColor"/>
    </svg>`,

  // Body Region: Hands / Face
  bodyHand: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M8 12.5V6.5C8 5.7 8.7 5 9.5 5C10.3 5 11 5.7 11 6.5V11M11 11V5.5C11 4.7 11.7 4 12.5 4C13.3 4 14 4.7 14 5.5V11M14 11V6.8C14 6 14.7 5.3 15.5 5.3C16.3 5.3 17 6 17 6.8V14.5C17 17.8 14.8 20 11.8 20C9.3 20 7.2 18.4 6.5 16L5.5 12.5C5.2 11.7 5.8 10.8 6.7 10.8C7.4 10.8 8 11.3 8 12.5Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Home / Scale Dashboard Navigation Icon
  dashboard: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M4 10.5L12 4L20 10.5V19C20 19.8 19.3 20.5 18.5 20.5H5.5C4.7 20.5 4 19.8 4 19V10.5Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8.5 15.5L10.8 13.2L12.8 14.8L15.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Prescriber Chat Navigation Icon
  chat: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M4.5 6.5C4.5 5.4 5.4 4.5 6.5 4.5H17.5C18.6 4.5 19.5 5.4 19.5 6.5V14.5C19.5 15.6 18.6 16.5 17.5 16.5H9.5L5 20V6.5Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="9" cy="10.5" r="1" fill="currentColor"/>
      <circle cx="12" cy="10.5" r="1" fill="currentColor"/>
      <circle cx="15" cy="10.5" r="1" fill="currentColor"/>
    </svg>`,

  // Patient Profile Navigation Icon
  profile: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8"/>
      <path d="M5.5 19.5C6.3 16.2 8.9 14.5 12 14.5C15.1 14.5 17.7 16.2 18.5 19.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // Weight Table / Log Icon
  weightTable: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.8"/>
      <path d="M3.5 9.5H20.5M9.5 9.5V19.5" stroke="currentColor" stroke-width="1.7"/>
      <path d="M13 13H17.5M13 16.5H16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,

  // Prescriber / Stethoscope Icon
  stethoscope: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M6 4.5V9.5C6 12.3 8.2 14.5 11 14.5C13.8 14.5 16 12.3 16 9.5V4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5 4.5H7M15 4.5H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M11 14.5V16.5C11 18.7 12.8 20.5 15 20.5C17.2 20.5 19 18.7 19 16.5V13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="19" cy="11.5" r="2" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.7"/>
    </svg>`,

  // Last Visit / Calendar Icon
  calendarVisit: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.8"/>
      <path d="M3.5 10H20.5M8 3.5V6.5M16 3.5V6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9.5 14.8L11.2 16.5L14.8 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Diuretic / Medication Capsule Icon
  pillDiuretic: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M10.5 5.2L5.2 10.5C3.6 12.1 3.6 14.7 5.2 16.3L7.7 18.8C9.3 20.4 11.9 20.4 13.5 18.8L18.8 13.5C20.4 11.9 20.4 9.3 18.8 7.7L16.3 5.2C14.7 3.6 12.1 3.6 10.5 5.2Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8 8L16 16" stroke="currentColor" stroke-width="1.8"/>
    </svg>`,

  // Critical Alert Bell / Siren Icon
  alertSiren: (cls = 'w-5 h-5') => `
    <svg viewBox="0 0 24 24" fill="none" class="${cls}" aria-hidden="true">
      <path d="M12 3.5C8.7 3.5 6 6.2 6 9.5V14L4 16.5H20L18 14V9.5C18 6.2 15.3 3.5 12 3.5Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M10 18.5C10.5 19.6 11.2 20.2 12 20.2C12.8 20.2 13.5 19.6 14 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 8.5V11.5M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  // Trend Up Warning
  trendUp: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M3 14L8 9L11.5 12.5L17 6.5M17 6.5H12.5M17 6.5V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Checkmark Seal
  checkSeal: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7 10.2L9 12.2L13.2 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Audio Sound Wave
  soundWave: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M3.5 8V12H6.5L10.5 15.5V4.5L6.5 8H3.5Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M13.5 7.5C14.3 8.3 14.7 9.1 14.7 10C14.7 10.9 14.3 11.7 13.5 12.5M15.8 5.5C17 6.8 17.7 8.3 17.7 10C17.7 11.7 17 13.2 15.8 14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

  // Send Arrow
  send: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M17.5 3.5L9 12M17.5 3.5L12 17.5L9 12L3.5 9L17.5 3.5Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    </svg>`,

  // Lock Shield
  lock: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="2.2" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7 9V6.8C7 5.1 8.3 3.8 10 3.8C11.7 3.8 13 5.1 13 6.8V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

  // Arrow Right
  arrowRight: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M4.5 10H15.5M15.5 10L11 5.5M15.5 10L11 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Plus Circle
  plus: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.6"/>
      <path d="M10 6.8V13.2M6.8 10H13.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // Trash Bin
  trash: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M4.5 6H15.5M8 6V4.2C8 3.8 8.3 3.5 8.7 3.5H11.3C11.7 3.5 12 3.8 12 4.2V6M6.5 6L7.2 15.8C7.3 16.5 7.8 17 8.5 17H11.5C12.2 17 12.7 16.5 12.8 15.8L13.5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Phone Call
  phone: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M5.2 3.8H8L9.3 7L7.5 8.5C8.5 10.4 9.8 11.7 11.7 12.7L13.2 10.9L16.4 12.2V15C16.4 15.9 15.6 16.7 14.7 16.6C8.8 16.1 4.1 11.4 3.6 5.5C3.5 4.6 4.3 3.8 5.2 3.8Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,

  // Sign Out
  logOut: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M8 4.5H5.5C4.7 4.5 4 5.2 4 6V14C4 14.8 4.7 15.5 5.5 15.5H8M12 6.5L15.8 10L12 13.5M15.5 10H8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  // Sync / Refresh
  sync: (cls = 'w-4 h-4') => `
    <svg viewBox="0 0 20 20" fill="none" class="${cls}" aria-hidden="true">
      <path d="M15.8 8.2C15 5.7 12.7 4 10 4C7.2 4 4.8 5.9 4.2 8.5M4.2 11.8C5 14.3 7.3 16 10 16C12.8 16 15.2 14.1 15.8 11.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M16.2 5V8.5H12.7M3.8 15V11.5H7.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};
window.CustomIcons = CustomIcons;
