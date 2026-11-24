import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-hospital-bg',
  standalone: true,
  template: `
    <video
      #videoEl
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      aria-hidden="true"
      class="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
    >
      <source src="hospital-bg.mp4" type="video/mp4" />
    </video>
    <div [class]="scrimClass()"></div>
  `
})
export class HospitalBgComponent implements AfterViewInit {
  readonly scrimClass = input<string>('fixed inset-0 bg-[#F3F0E8]/35 pointer-events-none z-0');
  private readonly videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  ngAfterViewInit(): void {
    const video = this.videoEl()?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {
      // Autoplay may be deferred by browser power-saving mode
    });
  }
}
