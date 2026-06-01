import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { ClientDashboard } from './pages/client-dashboard/client-dashboard';
import { CoachDashboard } from './pages/coach-dashboard/coach-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'client', component: ClientDashboard },
  { path: 'coach', component: CoachDashboard },
  { path: 'admin', component: AdminDashboard }
];