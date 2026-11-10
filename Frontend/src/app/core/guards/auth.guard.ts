import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole && !auth.hasRole(requiredRole)) {
    router.navigate(['/user/home']);
    return false;
  }

  return true;
};
