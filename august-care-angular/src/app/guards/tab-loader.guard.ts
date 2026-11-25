import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { finalize, map, timer } from 'rxjs';
import { CareStateService } from '../services/care-state.service';

const ROUTE_LABELS: Record<string, string> = {
  home: 'Fetching your Daily Weight & Symptom Dashboard...',
  chat: 'Connecting to Prescriber Chat...',
  profile: 'Opening Patient Profile & Medications...',
  prescriber: 'Loading Prescriber Triage EHR...'
};

export const tabLoaderGuard: CanActivateFn = route => {
  const care = inject(CareStateService);
  const router = inject(Router);
  const path = route.routeConfig?.path ?? '';

  if (!care.hasActivatedInitialPage && router.url === '/') {
    care.hasActivatedInitialPage = true;
    return true;
  }
  care.hasActivatedInitialPage = true;

  if (router.url === `/${path}`) {
    return true;
  }

  care.tabLoadingLabel.set(ROUTE_LABELS[path] ?? 'Loading next page...');
  care.isTabLoading.set(true);

  return timer(1800).pipe(
    map(() => true),
    finalize(() => care.isTabLoading.set(false))
  );
};
