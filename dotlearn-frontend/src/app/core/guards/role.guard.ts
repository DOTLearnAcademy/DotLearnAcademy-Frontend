import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const requiredRole = route.data['role'] as string;
  const user = localStorage.getItem('userProfile');

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  const parsed = JSON.parse(user);
  if (parsed.role !== requiredRole) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
