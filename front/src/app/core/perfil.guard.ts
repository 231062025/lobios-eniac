import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Perfil } from './models';

/**
 * Uso nas rotas: canActivate: [perfilGuard('rh')]
 * - não logado      -> volta para o login
 * - perfil errado   -> manda para a página do próprio perfil
 *
 * Lembrete: isso só esconde telas. Quem protege os DADOS é a RLS do Supabase
 * (e, futuramente, a API validando o token).
 */
export function perfilGuard(perfilPermitido: Perfil): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const usuario = auth.usuario();

    if (!usuario) return router.createUrlTree(['/']);
    // Primeiro acesso: só libera o sistema depois de trocar a senha provisória do RH.
    if (usuario.precisaTrocarSenha) return router.createUrlTree(['/primeiro-acesso']);
    if (usuario.perfil !== perfilPermitido) {
      return router.createUrlTree([auth.rotaInicial(usuario.perfil)]);
    }
    return true;
  };
}

/** Protege a tela de primeiro acesso: precisa estar logado e ainda com senha provisória. */
export const primeiroAcessoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuario();
  if (!usuario) return router.createUrlTree(['/']);
  if (!usuario.precisaTrocarSenha) return router.createUrlTree([auth.rotaInicial(usuario.perfil)]);
  return true;
};
