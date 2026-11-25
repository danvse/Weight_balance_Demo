import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CareStateService } from '../services/care-state.service';

export const authGuard: CanActivateFn = () => {
  const care = inject(CareStateService);
  const router = inject(Router);
  return care.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
