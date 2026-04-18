import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'student',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'instructor',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Instructor' },
    loadChildren: () =>
      import('./features/instructor/instructor.module').then(m => m.InstructorModule)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '/home' }
];
