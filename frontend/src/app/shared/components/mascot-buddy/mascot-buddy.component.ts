import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CareStateService } from '../../../core/services/care-state.service';

@Component({
  selector: 'app-mascot-buddy',
  standalone: true,
  template: `
    @if (!dismissed()) {
      <div class="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-30 flex items-end gap-2.5 max-w-[270px] sm:max-w-xs animate-slide-up">
        <!-- Mascot Avatar Button -->
        <button
          type="button"
          (click)="toggleBubble()"
          [title]="bubbleOpen() ? 'Hide mascot tip' : 'Open mascot tip'"
          [class]="isUrgent()
            ? 'w-14 h-14 rounded-2xl bg-white border-2 border-red-500 shadow-xl overflow-hidden shrink-0 hover:scale-105 active:scale-95 transition alert-beacon p-1'
            : care.todaySymptomSeverity() === 'mild'
              ? 'w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 shadow-xl overflow-hidden shrink-0 hover:scale-105 active:scale-95 transition p-1'
              : 'w-14 h-14 rounded-2xl bg-white border-2 border-august-forest/30 shadow-xl overflow-hidden shrink-0 hover:scale-105 active:scale-95 transition p-1'"
        >
          <img src="media/images/mascot.jpg" alt="August Care Mascot" class="w-full h-full object-contain rounded-xl" />
        </button>

        <!-- Speech Bubble -->
        @if (bubbleOpen()) {
          <div
            [class]="isUrgent()
              ? 'bg-white border-2 border-red-400 rounded-2xl rounded-bl-xs p-3 shadow-xl text-xs space-y-1.5 relative'
              : care.todaySymptomSeverity() === 'mild'
                ? 'bg-white border-2 border-amber-300 rounded-2xl rounded-bl-xs p-3 shadow-xl text-xs space-y-1.5 relative'
                : 'bg-white border border-august-border rounded-2xl rounded-bl-xs p-3 shadow-xl text-xs space-y-1.5 relative'"
          >
            <button
              type="button"
              (click)="dismissed.set(true)"
              aria-label="Hide mascot"
              class="absolute top-1.5 right-2 text-august-warmGray hover:text-august-dark text-[11px] font-bold"
            >
              ✕
            </button>
            <div [class]="isUrgent() ? 'font-bold text-red-700 pr-4' : care.todaySymptomSeverity() === 'mild' ? 'font-bold text-amber-800 pr-4' : 'font-bold text-august-forest pr-4'">
              {{ isUrgent() ? 'Care Buddy Alert!' : care.todaySymptomSeverity() === 'mild' ? 'Care Buddy Check-In' : 'Daily Care Buddy' }}
            </div>
            <p class="text-[11px] text-august-dark leading-relaxed">
              {{ tipMessage() }}
            </p>
            @if (isUrgent() || care.todaySymptomSeverity() === 'mild') {
              <button
                type="button"
                (click)="goToChat()"
                [class]="isUrgent()
                  ? 'w-full py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition'
                  : 'w-full py-1.5 px-2.5 rounded-lg bg-august-forest hover:bg-august-forestHover text-white font-bold text-[11px] transition'"
              >
                Message {{ care.prescriberShortName() }}
              </button>
            }
          </div>
        }
      </div>
    } @else {
      <button
        type="button"
        (click)="dismissed.set(false); bubbleOpen.set(true)"
        title="Show Care Mascot"
        class="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-30 w-11 h-11 rounded-2xl bg-white border border-august-border shadow-lg overflow-hidden p-1 hover:scale-105 transition"
      >
        <img src="media/images/mascot.jpg" alt="Show Mascot" class="w-full h-full object-contain rounded-xl" />
      </button>
    }
  `
})
export class MascotBuddyComponent {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);
  readonly metrics = this.care.clinicalMetrics;

  readonly bubbleOpen = signal(true);
  readonly dismissed = signal(false);

  readonly isUrgent = computed(
    () =>
      this.metrics().isConcerning ||
      this.care.todaySymptomSeverity() === 'severe' ||
      this.care.vitalsStatus().isConcerning
  );

  readonly tipMessage = computed(() => {
    const m = this.metrics();
    const s = this.care.todaySymptoms();
    const v = this.care.vitalsStatus();
    const doc = this.care.prescriberShortName();

    if (v.isConcerning) {
      return `Vitals flag (${v.alertReasons.join(', ')}): Please sit comfortably and contact ${doc} right away.`;
    }
    if (s.shortnessOfBreath === 'rest') {
      return `You reported shortness of breath at rest—please message ${doc} or call triage right away.`;
    }
    if (s.hasSwelling) {
      const locs = [...s.swellingLocations, s.swellingOther].filter(Boolean).join(', ');
      return `You logged ${locs || 'swelling'} today. Keep your legs elevated, watch fluids, and update ${doc}.`;
    }
    if (m.isConcerning) {
      return `Heads up! Your mattress weight is up ${this.care.formatUnitDelta(Math.max(m.overnightDelta, m.baselineDelta))}. Let’s check in with ${doc}.`;
    }
    if (s.poorAppetite) {
      return 'Noted your poor appetite today—try smaller, light meals and keep tracking your morning weight.';
    }
    if (s.shortnessOfBreath === 'mild') {
      return `Take it easy with activity today and let ${doc} know if your breathing feels tighter.`;
    }
    return `All clear today (${this.care.checkInCountLast7Days()}/7 check-ins logged)! ${this.care.formatWeight(m.latestWeight)} is steady near your ${this.care.formatWeight(m.baseline)} baseline.`;
  });

  toggleBubble(): void {
    this.bubbleOpen.update(v => !v);
  }

  goToChat(): void {
    this.router.navigateByUrl('/chat');
  }
}
