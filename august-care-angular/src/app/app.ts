import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CustomIconComponent } from './components/custom-icon/custom-icon.component';
import { HospitalBgComponent } from './components/hospital-bg/hospital-bg.component';
import { MascotBuddyComponent } from './components/mascot-buddy/mascot-buddy.component';
import { SymptomGateComponent } from './components/symptom-gate/symptom-gate.component';
import { UserRole } from './models/care.models';
import { CareStateService } from './services/care-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CustomIconComponent, HospitalBgComponent, SymptomGateComponent, MascotBuddyComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUrl = signal<string>(this.router.url);

  readonly activeBackgroundVideo = computed(() => {
    const url = this.currentUrl();
    if (this.care.userRole() === 'prescriber' || url.startsWith('/prescriber')) {
      return 'clinic-bg.mp4';
    }
    if (url.startsWith('/chat')) {
      return 'consult-bg.mp4';
    }
    if (url.startsWith('/profile')) {
      return 'clinic-bg.mp4';
    }
    return 'hospital-bg.mp4';
  });

  constructor() {
    const sub = this.router.events
      .pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd))
      .subscribe(evt => this.currentUrl.set(evt.urlAfterRedirects));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  switchRole(role: UserRole): void {
    this.care.switchRole(role);
    this.router.navigateByUrl(role === 'prescriber' ? '/prescriber' : '/home');
  }

  signOut(): void {
    this.care.signOut();
    this.router.navigateByUrl('/login');
  }
}
