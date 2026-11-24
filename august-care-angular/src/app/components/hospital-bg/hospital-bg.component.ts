import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-hospital-bg',
  standalone: true,
  template: `
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F3F0E8]" aria-hidden="true">
      <video
        #videoA
        autoplay
        muted
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="hospital-bg.mp4" type="video/mp4" />
      </video>
      <video
        #videoB
        muted
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="hospital-bg.mp4" type="video/mp4" />
      </video>
    </div>
    <div [class]="scrimClass()"></div>
  `
})
export class HospitalBgComponent implements AfterViewInit {
  readonly scrimClass = input<string>('fixed inset-0 bg-[#F3F0E8]/35 pointer-events-none z-0');

  private readonly destroyRef = inject(DestroyRef);
  private readonly videoA = viewChild<ElementRef<HTMLVideoElement>>('videoA');
  private readonly videoB = viewChild<ElementRef<HTMLVideoElement>>('videoB');

  private readonly fadeMs = 1400;
  private activeIdx: 0 | 1 = 0;
  private isFading = false;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    if (!a || !b) return;

    const videos: [HTMLVideoElement, HTMLVideoElement] = [a, b];

    // Configure initial layer stack: A active on top, B preloaded underneath
    videos.forEach((v, idx) => {
      v.muted = true;
      v.defaultMuted = true;
      v.style.opacity = '1';
      v.style.zIndex = idx === 0 ? '2' : '1';
      v.style.transition = idx === 0 ? `opacity ${this.fadeMs}ms ease-in-out` : 'none';
    });

    const onTick = (idx: 0 | 1) => {
      if (idx !== this.activeIdx || this.isFading) return;
      const current = videos[idx];
      if (!Number.isFinite(current.duration) || current.duration <= 0) return;

      const fadeSec = Math.min(this.fadeMs / 1000, current.duration * 0.35);
      if (current.currentTime >= current.duration - fadeSec - 0.15) {
        this.startCrossfade(videos);
      }
    };

    const onEnded = (idx: 0 | 1) => {
      if (idx !== this.activeIdx) return;
      if (!this.isFading) {
        this.startCrossfade(videos);
      }
    };

    const onTimeA = () => onTick(0);
    const onTimeB = () => onTick(1);
    const onEndA = () => onEnded(0);
    const onEndB = () => onEnded(1);

    a.addEventListener('timeupdate', onTimeA);
    b.addEventListener('timeupdate', onTimeB);
    a.addEventListener('ended', onEndA);
    b.addEventListener('ended', onEndB);

    this.safePlay(a);

    this.destroyRef.onDestroy(() => {
      a.removeEventListener('timeupdate', onTimeA);
      b.removeEventListener('timeupdate', onTimeB);
      a.removeEventListener('ended', onEndA);
      b.removeEventListener('ended', onEndB);
      if (this.fadeTimer) clearTimeout(this.fadeTimer);
    });
  }

  private startCrossfade(videos: [HTMLVideoElement, HTMLVideoElement]): void {
    this.isFading = true;
    const fromIdx = this.activeIdx;
    const toIdx: 0 | 1 = fromIdx === 0 ? 1 : 0;
    const fromVideo = videos[fromIdx];
    const toVideo = videos[toIdx];

    // Prepare underlying next video at frame 0 with full opacity before dissolving top layer
    toVideo.style.transition = 'none';
    toVideo.style.zIndex = '1';
    toVideo.style.opacity = '1';
    toVideo.currentTime = 0;
    this.safePlay(toVideo);

    // Dissolve active top video smoothly into the playing underlying video
    fromVideo.style.zIndex = '2';
    fromVideo.style.transition = `opacity ${this.fadeMs}ms ease-in-out`;
    void fromVideo.offsetWidth;
    fromVideo.style.opacity = '0';

    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      // Promote incoming video to top while outgoing is invisible (opacity 0)
      toVideo.style.transition = 'none';
      toVideo.style.zIndex = '2';

      fromVideo.style.transition = 'none';
      fromVideo.style.zIndex = '1';
      fromVideo.pause();
      fromVideo.currentTime = 0;
      fromVideo.style.opacity = '1';

      void toVideo.offsetWidth;
      toVideo.style.transition = `opacity ${this.fadeMs}ms ease-in-out`;

      this.activeIdx = toIdx;
      this.isFading = false;
    }, this.fadeMs + 60);
  }

  private safePlay(video: HTMLVideoElement): void {
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          // Ignore autoplay restrictions
        });
      }
    } catch {
      // Ignore in non-media test environments
    }
  }
}
