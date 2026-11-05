import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Reglement } from './features/reglement/reglement';
import { Editions } from './features/editions/editions';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'reglement', component: Reglement },
  { path: 'editions/:id', component: Editions }
];
