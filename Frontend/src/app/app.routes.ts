import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/user/home', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/user/home/home.component').then(m => m.HomeComponent) },
      { path: 'search', loadComponent: () => import('./pages/user/search/search.component').then(m => m.SearchComponent) },
      { path: 'trip/:id', loadComponent: () => import('./pages/user/trip-detail/trip-detail.component').then(m => m.TripDetailComponent) },
      { path: 'my-trips', loadComponent: () => import('./pages/user/my-trips/my-trips.component').then(m => m.MyTripsComponent) },
      { path: 'publish-trip', loadComponent: () => import('./pages/user/publish-trip/publish-trip.component').then(m => m.PublishTripComponent) },
      { path: 'bookings', loadComponent: () => import('./pages/user/bookings/bookings.component').then(m => m.BookingsComponent) },
      { path: 'tracking/:bookingId', loadComponent: () => import('./pages/user/tracking/tracking.component').then(m => m.TrackingComponent) },
      { path: 'payments', loadComponent: () => import('./pages/user/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/user/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notifications', loadComponent: () => import('./pages/user/notifications/notifications.component').then(m => m.NotificationsComponent) },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users/users.component').then(m => m.AdminUsersComponent) },
      { path: 'trips', loadComponent: () => import('./pages/admin/trips/trips.component').then(m => m.AdminTripsComponent) },
      { path: 'bookings', loadComponent: () => import('./pages/admin/bookings/bookings.component').then(m => m.AdminBookingsComponent) },
      { path: 'payments', loadComponent: () => import('./pages/admin/payments/payments.component').then(m => m.AdminPaymentsComponent) },
      { path: 'ratings', loadComponent: () => import('./pages/admin/ratings/ratings.component').then(m => m.AdminRatingsComponent) },
      { path: 'matching', loadComponent: () => import('./pages/admin/matching/matching.component').then(m => m.AdminMatchingComponent) },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.AdminSettingsComponent) },
    ]
  },
  { path: '**', redirectTo: '/user/home' }
];
