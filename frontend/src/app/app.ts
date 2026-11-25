import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CustomIconComponent } from './shared/components/custom-icon/custom-icon.component';
import { HospitalBgComponent } from './shared/components/hospital-bg/hospital-bg.component';
import { MascotBuddyComponent } from './shared/components/mascot-buddy/mascot-buddy.component';
import { MascotLoaderComponent } from './shared/components/mascot-loader/mascot-loader.component';
import { SymptomGateComponent } from './shared/components/symptom-gate/symptom-gate.component';
import { UserRole } from './core/models/care.models';
import { CareStateService } from './core/services/care-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CustomIconComponent,
    HospitalBgComponent,
    SymptomGateComponent,
    MascotBuddyComponent,
    MascotLoaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUrl = signal<string>(this.router.url);

  readonly activeBackgroundVideo = computed<string>(() => {
    const url = this.currentUrl();
    if (this.care.userRole() === 'prescriber' || url.startsWith('/prescriber')) {
      return 'media/videos/clinic-bg.mp4';
    }
    if (url.startsWith('/chat')) {
      return 'media/videos/consult-bg.mp4';
    }
    if (url.startsWith('/profile')) {
      return 'media/videos/clinic-bg.mp4';
    }
    return 'media/videos/hospital-bg.mp4';
  });

  constructor() {
    const sub = this.router.events
      .pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd))
      .subscribe(evt => this.currentUrl.set(evt.urlAfterRedirects));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  switchRole(role: UserRole): void {
    const target = role === 'prescriber' ? '/prescriber' : '/home';
    this.router.navigateByUrl(target).then(ok => {
      if (ok) this.care.switchRole(role);
    });
  }

  signOut(): void {
    this.care.signOut();
    this.router.navigateByUrl('/login');
  }
}
