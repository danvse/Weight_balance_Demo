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
  readonly videoSrc = input<string | string[]>('hospital-bg.mp4');
  readonly scrimClass = input<string>('fixed inset-0 bg-[#F3F0E8]/35 pointer-events-none z-0');
  readonly playbackRate = input<number>(1.0);

  private readonly destroyRef = inject(DestroyRef);
  private readonly videoA = viewChild<ElementRef<HTMLVideoElement>>('videoA');
  private readonly videoB = viewChild<ElementRef<HTMLVideoElement>>('videoB');

  private readonly fadeMs = 1400;
  private activeIdx: 0 | 1 = 0;
  private playlist: string[] = ['hospital-bg.mp4'];
  private playlistIdx = 0;
  private isFading = false;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private playlistSignature = '';
  private initialized = false;

  constructor() {
    effect(() => {
      const nextList = this.normalizePlaylist(this.videoSrc());
      const sig = nextList.join('|');
      if (!this.initialized || sig === this.playlistSignature) return;
      this.switchPlaylist(nextList, sig);
    });

    effect(() => {
      const rate = this.getClampedRate();
      const a = this.videoA()?.nativeElement;
      const b = this.videoB()?.nativeElement;
      if (a) this.applyRate(a, rate);
      if (b) this.applyRate(b, rate);
    });
  }

  ngAfterViewInit(): void {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    if (!a || !b) return;

    const videos: [HTMLVideoElement, HTMLVideoElement] = [a, b];
    this.playlist = this.normalizePlaylist(this.videoSrc());
    this.playlistSignature = this.playlist.join('|');
    this.playlistIdx = 0;

    const secondSrc = this.playlist[1 % this.playlist.length];
    this.setVideoSource(a, this.playlist[0]);
    this.setVideoSource(b, secondSrc);

    videos.forEach((v, idx) => {
      v.muted = true;
      v.defaultMuted = true;
      this.applyRate(v);
      v.style.opacity = '1';
      v.style.zIndex = idx === 0 ? '2' : '1';
      v.style.transition = idx === 0 ? `opacity ${this.fadeMs}ms ease-in-out` : 'none';
    });

    const onTick = (idx: 0 | 1) => {
      if (idx !== this.activeIdx || this.isFading) return;
      const current = videos[idx];
      if (!Number.isFinite(current.duration) || current.duration <= 0) return;

      const fadeSec = Math.min((this.fadeMs / 1000) * this.getClampedRate(), current.duration * 0.35);
      if (current.currentTime >= current.duration - fadeSec - 0.15) {
        this.advanceToNext(videos);
      }
    };

    const onEnded = (idx: 0 | 1) => {
      if (idx !== this.activeIdx || this.isFading) return;
      this.advanceToNext(videos);
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

  private normalizePlaylist(raw: string | string[]): string[] {
    const arr = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    return arr.length ? arr : ['hospital-bg.mp4'];
  }

  private setVideoSource(video: HTMLVideoElement, src: string): void {
    if (video.getAttribute('data-src') === src) return;
    video.setAttribute('data-src', src);
    video.src = src;
    if (typeof video.load === 'function') video.load();
    this.applyRate(video);
  }

  private switchPlaylist(nextList: string[], sig: string): void {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    if (!a || !b) return;

    this.playlist = nextList;
    this.playlistSignature = sig;
    this.playlistIdx = 0;

    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.isFading = false;

    const videos: [HTMLVideoElement, HTMLVideoElement] = [a, b];
    const standbyIdx: 0 | 1 = this.activeIdx === 0 ? 1 : 0;
    this.setVideoSource(videos[standbyIdx], this.playlist[0]);

    this.crossfadeToTarget(videos, 0);
  }

  private advanceToNext(videos: [HTMLVideoElement, HTMLVideoElement]): void {
    const nextPlaylistIdx = (this.playlistIdx + 1) % this.playlist.length;
    const standbyIdx: 0 | 1 = this.activeIdx === 0 ? 1 : 0;
    this.setVideoSource(videos[standbyIdx], this.playlist[nextPlaylistIdx]);
    this.crossfadeToTarget(videos, nextPlaylistIdx);
  }

  private crossfadeToTarget(videos: [HTMLVideoElement, HTMLVideoElement], targetPlaylistIdx: number): void {
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

      // Preload the subsequent clip into the standby layer for the next transition
      const preloadPlaylistIdx = (targetPlaylistIdx + 1) % this.playlist.length;
      this.setVideoSource(fromVideo, this.playlist[preloadPlaylistIdx]);
      fromVideo.currentTime = 0;
      fromVideo.style.opacity = '1';

      void toVideo.offsetWidth;
      toVideo.style.transition = `opacity ${this.fadeMs}ms ease-in-out`;

      this.activeIdx = toIdx;
      this.playlistIdx = targetPlaylistIdx;
      this.isFading = false;
    }, this.fadeMs + 60);
  }

  private getClampedRate(): number {
    const rate = Number(this.playbackRate());
    return Number.isFinite(rate) ? Math.max(0.25, Math.min(2.0, rate)) : 1.0;
  }

  private applyRate(video: HTMLVideoElement, rate = this.getClampedRate()): void {
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
  }

  private safePlay(video: HTMLVideoElement): void {
    try {
      this.applyRate(video);
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
