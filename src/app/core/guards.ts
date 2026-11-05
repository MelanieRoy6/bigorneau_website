import { Injector, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

/**
 * Charge le service d'authentification à la demande : la librairie Supabase
 * n'alourdit ainsi pas la page d'accueil, seulement l'espace orga.
 */
async function loadAuth(injector: Injector) {
  const { Auth } = await import('./auth');
  const auth = injector.get(Auth);
  await auth.ready();
  return auth;
}

/** Accès réservé aux comptes connectés (admin ou participant). */
export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const injector = inject(Injector);
  const router = inject(Router);
  const auth = await loadAuth(injector);
  return auth.isSignedIn() ? true : router.createUrlTree(['/orga/connexion']);
};

/** Accès réservé aux administrateurs. */
export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const injector = inject(Injector);
  const router = inject(Router);
  const auth = await loadAuth(injector);
  if (!auth.isSignedIn()) return router.createUrlTree(['/orga/connexion']);
  return auth.isAdmin() ? true : router.createUrlTree(['/orga']);
};

/** La page de connexion renvoie vers l'espace si on est déjà connecté. */
export const guestGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const injector = inject(Injector);
  const router = inject(Router);
  const auth = await loadAuth(injector);
  return auth.isSignedIn() ? router.createUrlTree(['/orga']) : true;
};
