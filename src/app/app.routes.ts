import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Reglement } from './features/reglement/reglement';
import { Editions } from './features/editions/editions';
import { Faq } from './features/faq/faq';
import { adminGuard, authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'reglement', component: Reglement },
  { path: 'faq', component: Faq },
  { path: 'editions/:id', component: Editions },
  {
    path: 'inscription',
    loadComponent: () => import('./features/inscription/inscription').then((m) => m.Inscription),
  },
  {
    path: 'orga/connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./orga/connexion/connexion').then((m) => m.Connexion),
  },
  {
    path: 'orga',
    canActivate: [authGuard],
    loadComponent: () => import('./orga/shell/shell').then((m) => m.OrgaShell),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./orga/planning/planning').then((m) => m.Planning) },
      { path: 'infos', loadComponent: () => import('./orga/infos/infos').then((m) => m.Infos) },
      { path: 'inscrits', canActivate: [adminGuard], loadComponent: () => import('./orga/inscrits/inscrits').then((m) => m.Inscrits) },
      { path: 'tirage', canActivate: [adminGuard], loadComponent: () => import('./orga/tirage/tirage').then((m) => m.Tirage) },
      { path: 'cotisations', canActivate: [adminGuard], loadComponent: () => import('./orga/cotisations/cotisations').then((m) => m.Cotisations) },
    ],
  },
  { path: '**', redirectTo: '' },
];
