import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { CareStateService } from '../../services/care-state.service';

@Component({
  selector: 'app-mascot-loader',
  standalone: true,
  template: `
    <div
      style="position: fixed; inset: 0; z-index: 9999; background-color: rgba(248, 247, 242, 0.88); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"
      class="flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-august-border p-6 sm:p-8 max-w-sm w-full text-center space-y-4 animate-slide-up">
        <div class="w-56 h-40 mx-auto rounded-2xl overflow-hidden bg-white flex items-center justify-center relative">
          <video
            #loaderVideo
            src="mascot-loader.mp4"
            poster="mascot.jpg"
            autoplay
            loop
            muted
            playsinline
            preload="auto"
            class="w-full h-full object-contain mix-blend-multiply"
          ></video>
        </div>

        <div class="space-y-1">
          <div class="text-xs font-bold uppercase tracking-widest text-august-forest">August Care</div>
          <p class="text-base font-serif font-medium text-august-dark">{{ care.tabLoadingLabel() }}</p>
        </div>

        <div class="w-full h-2 bg-august-ivory rounded-full overflow-hidden border border-august-border/60">
          <div class="h-full bg-august-forest rounded-full animate-loader-bar"></div>
        </div>
      </div>
    </div>
  `
})
export class MascotLoaderComponent implements AfterViewInit {
  readonly care = inject(CareStateService);
  private readonly loaderVideo = viewChild<ElementRef<HTMLVideoElement>>('loaderVideo');

  ngAfterViewInit(): void {
    const video = this.loaderVideo()?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playbackRate = 1.25;
    try {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Ignore autoplay restrictions
        });
      }
    } catch {
      // Ignore in non-media test environments
    }
  }
}
