import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CustomIconComponent } from './components/custom-icon/custom-icon.component';
import { MascotBuddyComponent } from './components/mascot-buddy/mascot-buddy.component';
import { SymptomGateComponent } from './components/symptom-gate/symptom-gate.component';
import { UserRole } from './models/care.models';
import { CareStateService } from './services/care-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CustomIconComponent, SymptomGateComponent, MascotBuddyComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly care = inject(CareStateService);
  private readonly router = inject(Router);

  switchRole(role: UserRole): void {
    this.care.switchRole(role);
    this.router.navigateByUrl(role === 'prescriber' ? '/prescriber' : '/home');
  }

  signOut(): void {
    this.care.signOut();
    this.router.navigateByUrl('/login');
  }
}
