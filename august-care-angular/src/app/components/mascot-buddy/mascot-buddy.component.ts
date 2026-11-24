import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CareStateService } from '../../services/care-state.service';

@Component({
  selector: 'app-mascot-buddy',
  standalone: true,
  template: `
    @if (!dismissed()) {
      <div class="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-30 flex items-end gap-2.5 max-w-xs animate-slide-up">
        <!-- Mascot Avatar Button -->
        <button
          type="button"
          (click)="toggleBubble()"
          [title]="bubbleOpen() ? 'Hide mascot tip' : 'Open mascot tip'"
          [class]="metrics().isConcerning
            ? 'w-14 h-14 rounded-2xl bg-white border-2 border-red-500 shadow-xl overflow-hidden shrink-0 hover:scale-105 active:scale-95 transition alert-beacon p-1'
            : 'w-14 h-14 rounded-2xl bg-white border-2 border-august-forest/30 shadow-xl overflow-hidden shrink-0 hover:scale-105 active:scale-95 transition p-1'"
        >
          <img src="mascot.jpg" alt="August Care Mascot" class="w-full h-full object-contain rounded-xl" />
        </button>

        <!-- Speech Bubble -->
        @if (bubbleOpen()) {
          <div
            [class]="metrics().isConcerning
              ? 'bg-white border-2 border-red-400 rounded-2xl rounded-bl-xs p-3 shadow-xl text-xs space-y-1.5 relative'
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
            <div [class]="metrics().isConcerning ? 'font-bold text-red-700 pr-4' : 'font-bold text-august-forest pr-4'">
              {{ metrics().isConcerning ? 'Care Buddy Alert!' : 'Daily Care Buddy' }}
            </div>
            <p class="text-[11px] text-august-dark leading-relaxed">
              {{ tipMessage() }}
            </p>
            @if (metrics().isConcerning) {
              <button
                type="button"
                (click)="goToChat()"
                class="w-full py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition"
              >
                Message Dr. Miller
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
        <img src="mascot.jpg" alt="Show Mascot" class="w-full h-full object-contain rounded-xl" />
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

  readonly tipMessage = computed(() => {
    const m = this.metrics();
    if (m.isConcerning) {
      return `Heads up! Your mattress weight is up ${this.care.formatDelta(Math.max(m.overnightDelta, m.baselineDelta))}. Let’s check in with Dr. Miller.`;
    }
    return `Great job checking in! Today’s ${m.latestWeight.toFixed(1)} lb reading is steady near your ${m.baseline.toFixed(1)} lb baseline.`;
  });

  toggleBubble(): void {
    this.bubbleOpen.update(v => !v);
  }

  goToChat(): void {
    this.router.navigateByUrl('/chat');
  }
}
