import { AfterViewInit, Component, DestroyRef, ElementRef, effect, inject, input, viewChild } from '@angular/core';

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
      ></video>
      <video
        #videoB
        muted
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover"
      ></video>
    </div>
    <div [class]="scrimClass()"></div>
  `
})
export class HospitalBgComponent implements AfterViewInit {
  readonly videoSrc = input<string>('hospital-bg.mp4');
  readonly scrimClass = input<string>('fixed inset-0 bg-[#F3F0E8]/35 pointer-events-none z-0');

  private readonly destroyRef = inject(DestroyRef);
  private readonly videoA = viewChild<ElementRef<HTMLVideoElement>>('videoA');
  private readonly videoB = viewChild<ElementRef<HTMLVideoElement>>('videoB');

  private readonly fadeMs = 1400;
  private activeIdx: 0 | 1 = 0;
  private isFading = false;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private currentSrc = '';
  private initialized = false;

  constructor() {
    effect(() => {
      const nextSrc = this.videoSrc();
      if (!this.initialized || nextSrc === this.currentSrc) return;
      this.switchVideoSource(nextSrc);
    });
  }

  ngAfterViewInit(): void {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    if (!a || !b) return;

    const videos: [HTMLVideoElement, HTMLVideoElement] = [a, b];
    this.currentSrc = this.videoSrc();

    videos.forEach((v, idx) => {
      v.muted = true;
      v.defaultMuted = true;
      v.src = this.currentSrc;
      v.style.opacity = '1';
      v.style.zIndex = idx === 0 ? '2' : '1';
      v.style.transition = idx === 0 ? `opacity ${this.fadeMs}ms ease-in-out` : 'none';
      if (typeof v.load === 'function') v.load();
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
    this.initialized = true;

    this.destroyRef.onDestroy(() => {
      a.removeEventListener('timeupdate', onTimeA);
      b.removeEventListener('timeupdate', onTimeB);
      a.removeEventListener('ended', onEndA);
      b.removeEventListener('ended', onEndB);
      if (this.fadeTimer) clearTimeout(this.fadeTimer);
    });
  }

  private switchVideoSource(nextSrc: string): void {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    if (!a || !b) return;

    this.currentSrc = nextSrc;
    const videos: [HTMLVideoElement, HTMLVideoElement] = [a, b];
    const nextIdx: 0 | 1 = this.activeIdx === 0 ? 1 : 0;
    const nextVideo = videos[nextIdx];

    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.isFading = false;

    nextVideo.src = nextSrc;
    if (typeof nextVideo.load === 'function') nextVideo.load();
    this.startCrossfade(videos, nextSrc);
  }

  private startCrossfade(videos: [HTMLVideoElement, HTMLVideoElement], syncOtherSrc?: string): void {
    this.isFading = true;
    const fromIdx = this.activeIdx;
    const toIdx: 0 | 1 = fromIdx === 0 ? 1 : 0;
    const fromVideo = videos[fromIdx];
    const toVideo = videos[toIdx];

    toVideo.style.transition = 'none';
    toVideo.style.zIndex = '1';
    toVideo.style.opacity = '1';
    toVideo.currentTime = 0;
    this.safePlay(toVideo);

    fromVideo.style.zIndex = '2';
    fromVideo.style.transition = `opacity ${this.fadeMs}ms ease-in-out`;
    void fromVideo.offsetWidth;
    fromVideo.style.opacity = '0';

    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      toVideo.style.transition = 'none';
      toVideo.style.zIndex = '2';

      fromVideo.style.transition = 'none';
      fromVideo.style.zIndex = '1';
      fromVideo.pause();
      if (syncOtherSrc) {
        fromVideo.src = syncOtherSrc;
        if (typeof fromVideo.load === 'function') fromVideo.load();
      }
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
