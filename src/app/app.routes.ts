import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Reglement } from './features/reglement/reglement';
import { Editions } from './features/editions/editions';
import { Faq } from './features/faq/faq';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'reglement', component: Reglement },
  { path: 'faq', component: Faq },
  { path: 'editions/:id', component: Editions }
];
