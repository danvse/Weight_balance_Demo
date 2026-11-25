import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareStateService } from '../../core/services/care-state.service';
import { CustomIconComponent } from '../../shared/components/custom-icon/custom-icon.component';

@Component({
  selector: 'app-prescriber-chat',
  standalone: true,
  imports: [FormsModule, CustomIconComponent],
  template: `
    <div class="bg-white rounded-3xl border border-august-border shadow-sm overflow-hidden flex flex-col h-[70vh] min-h-[520px] max-h-[720px]">
      <!-- Chat Header -->
      <div class="p-4 bg-august-ivory border-b border-august-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-august-forest text-white flex items-center justify-center font-serif font-bold text-base">{{ care.prescriberInitials() }}</div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-august-dark">{{ care.patient().prescriberName }}</h2>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <p class="text-xs text-august-warmGray">{{ care.patient().prescriberSpecialty }} • Direct Care Chat</p>
          </div>
        </div>
        <button
          type="button"
          (click)="care.shareVitalsInChat()"
          class="px-3.5 py-2 rounded-xl bg-white border border-august-border hover:border-august-forest text-august-forest text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
        >
          <app-icon name="mattressScale" iconClass="w-4 h-4" />
          <span class="hidden sm:inline">Share Today's Weight &amp; Symptoms</span>
          <span class="sm:hidden">Share Vitals</span>
        </button>
      </div>

      <!-- Messages Stream -->
      <div #chatStream class="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-4 bg-august-ivory/35">
        @for (m of care.chatMessages(); track m.id) {
          @if (m.sender === 'system') {
            <div class="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-august-dark max-w-xl mx-auto shadow-xs flex items-start gap-2.5">
              <app-icon name="alertSiren" iconClass="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div class="font-bold text-red-700">Automated Mattress Scale Alert • {{ m.time }}</div>
                <p class="mt-0.5 text-august-dark leading-relaxed">{{ m.text }}</p>
              </div>
            </div>
          } @else if (m.sender === 'patient') {
            <div class="flex items-end justify-end gap-2.5 ml-auto max-w-xl">
              <div class="bg-august-forest text-white px-4 py-3 rounded-2xl rounded-br-xs shadow-xs text-xs sm:text-sm space-y-1">
                <p class="leading-relaxed">{{ m.text }}</p>
                <span class="text-[10px] text-emerald-200 block text-right">{{ m.time }}</span>
              </div>
            </div>
          } @else {
            <div class="flex items-end gap-2.5 max-w-xl">
              <div class="w-8 h-8 rounded-xl bg-august-forest text-white flex items-center justify-center font-serif text-xs font-bold shrink-0">{{ care.prescriberInitials() }}</div>
              <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-xs shadow-xs border border-august-border text-xs sm:text-sm text-august-dark space-y-1">
                <p class="leading-relaxed">{{ m.text }}</p>
                <span class="text-[10px] text-august-warmGray block text-right">{{ m.time }}</span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Typing Indicator -->
      @if (care.isDoctorTyping()) {
        <div class="px-6 py-2 bg-august-ivory/35 flex items-center gap-2 text-xs text-august-warmGray">
          <div class="flex gap-1 px-3 py-2 bg-white border border-august-border rounded-2xl">
            <span class="w-1.5 h-1.5 rounded-full bg-august-forest typing-dot"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-august-forest typing-dot"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-august-forest typing-dot"></span>
          </div>
          <span>{{ care.prescriberShortName() }} is typing...</span>
        </div>
      }

      <!-- Quick Question Chips -->
      <div class="px-4 pt-2.5 pb-1 bg-white border-t border-august-border flex gap-2 overflow-x-auto custom-scroll">
        @for (chip of quickPrompts; track chip.label) {
          <button
            type="button"
            (click)="sendQuick(chip.text)"
            class="shrink-0 px-3 py-1.5 rounded-full bg-august-ivory hover:bg-august-sage border border-august-border text-[11px] font-semibold text-august-dark transition"
          >
            {{ chip.label }}
          </button>
        }
      </div>

      <!-- Input Bar -->
      <form (ngSubmit)="send()" class="p-3.5 sm:p-4 bg-white flex items-center gap-2.5">
        <input
          [(ngModel)]="draft"
          name="chatDraft"
          type="text"
          [placeholder]="'Ask ' + care.prescriberShortName() + ' a question or mention symptoms...'"
          class="flex-1 bg-august-ivory rounded-2xl px-4 py-3 text-xs sm:text-sm text-august-dark border border-august-border"
        />
        <button
          type="submit"
          class="px-4 sm:px-5 py-3 rounded-2xl bg-august-forest hover:bg-august-forestHover text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs"
        >
          <span class="hidden sm:inline">Send</span>
          <app-icon name="send" iconClass="w-4 h-4" />
        </button>
      </form>
    </div>
  `
})
export class PrescriberChatComponent {
  readonly care = inject(CareStateService);
  private readonly chatStream = viewChild<ElementRef<HTMLDivElement>>('chatStream');

  draft = '';

  readonly quickPrompts = [
    { label: 'Extra diuretic today?', text: 'Should I take an extra Furosemide pill today?' },
    { label: 'Report swelling change', text: 'My ankle swelling feels slightly worse this morning.' },
    { label: 'Request follow-up', text: 'Can we schedule a quick telehealth follow-up?' }
  ];

  constructor() {
    this.care.markChatRead();

    effect(() => {
      this.care.chatMessages();
      this.care.isDoctorTyping();
      setTimeout(() => {
        const el = this.chatStream()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  send(): void {
    if (!this.draft.trim()) return;
    this.care.sendPatientChat(this.draft);
    this.draft = '';
  }

  sendQuick(text: string): void {
    this.care.sendPatientChat(text);
  }
}
