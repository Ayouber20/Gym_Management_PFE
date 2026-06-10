import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  /*
    Important avec Angular SSR :
    Pendant le rendu serveur, localStorage n'existe pas.
    Donc on laisse passer côté serveur, puis le navigateur fera la vraie vérification.
  */
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.getUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[];

  if (expectedRoles && expectedRoles.length > 0) {
    if (!expectedRoles.includes(user.role)) {
      alert('Accès non autorisé.');

      if (user.role === 'CLIENT') {
        router.navigate(['/client']);
      } else if (user.role === 'COACH') {
        router.navigate(['/coach']);
      } else if (user.role === 'ADMIN') {
        router.navigate(['/admin']);
      } else {
        router.navigate(['/login']);
      }

      return false;
    }
  }

  return true;
};