import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ProfileService } from '../services/profile.service';

export const profileGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  if (profileService.hasSelectedProfile()) {
    return true;
  }

  return router.createUrlTree(['/profiles']);
};
