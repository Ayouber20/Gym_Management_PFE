import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { ClientDashboard } from './pages/client-dashboard/client-dashboard';
import { CoachDashboard } from './pages/coach-dashboard/coach-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

import { Tennis } from './pages/tennis/tennis';
import { Gym } from './pages/gym/gym';
import { Piscine } from './pages/piscine/piscine';

import { CoachRequest } from './pages/coach-request/coach-request';
import { Login } from './pages/login/login';

import { ClientTennis } from './pages/client-tennis/client-tennis';
import { ClientReservations } from './pages/client-reservations/client-reservations';
import { ClientCoachRequests } from './pages/client-coach-requests/client-coach-requests';

import { CoachRequests } from './pages/coach-requests/coach-requests';
import { CoachSessions } from './pages/coach-sessions/coach-sessions';
import { CoachGroupClasses } from './pages/coach-group-classes/coach-group-classes';
import { CoachLeavings } from './pages/coach-leavings/coach-leavings';

import { AdminUsers } from './pages/admin-users/admin-users';
import { AdminClients } from './pages/admin-clients/admin-clients';
import { AdminCoaches } from './pages/admin-coaches/admin-coaches';
import { AdminCourts } from './pages/admin-courts/admin-courts';
import { AdminReservations } from './pages/admin-reservations/admin-reservations';
import { AdminCoachRequests } from './pages/admin-coach-requests/admin-coach-requests';
import { AdminStatistics } from './pages/admin-statistics/admin-statistics';
import { AdminCoachLeavings } from './pages/admin-coach-leavings/admin-coach-leavings';

import { authGuard } from './guards/auth-guard';



export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },

  { path: 'tennis', component: Tennis },
  { path: 'gym', component: Gym },
  { path: 'piscine', component: Piscine },

  {
    path: 'client',
    component: ClientDashboard,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'client/tennis',
    component: ClientTennis,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'client/reservations',
    component: ClientReservations,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'client/coach-requests',
    component: ClientCoachRequests,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'demande-coach',
    component: CoachRequest,
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },

  {
    path: 'coach',
    component: CoachDashboard,
    canActivate: [authGuard],
    data: { roles: ['COACH'] }
  },
  {
    path: 'coach/requests',
    component: CoachRequests,
    canActivate: [authGuard],
    data: { roles: ['COACH'] }
  },
  {
    path: 'coach/sessions',
    component: CoachSessions,
    canActivate: [authGuard],
    data: { roles: ['COACH'] }
  },
  {
    path: 'coach/group-classes',
    component: CoachGroupClasses,
    canActivate: [authGuard],
    data: { roles: ['COACH'] }
  },
  {
    path: 'coach/leavings',
    component: CoachLeavings,
    canActivate: [authGuard],
    data: { roles: ['COACH'] }
  },

  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/clients',
    component: AdminClients,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/coaches',
    component: AdminCoaches,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/courts',
    component: AdminCourts,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/reservations',
    component: AdminReservations,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/coach-requests',
    component: AdminCoachRequests,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },

  {
    path: 'admin/coach-leavings',
    component: AdminCoachLeavings,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },

  {
    path: 'admin/statistics',
    component: AdminStatistics,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  }
];