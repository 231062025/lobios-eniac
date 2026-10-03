import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificacaoService } from '../../core/notificacao.service';
import { TrocarSenha } from '../../shared/trocar-senha/trocar-senha';

/**
 * Fluxo: o RH cadastra a pessoa com uma senha provisória -> no primeiro login
 * ela cai aqui e só acessa o sistema depois de criar a própria senha.
 */
@Component({
  selector: 'app-primeiro-acesso',
  imports: [TrocarSenha],
  template: `
    <main class="primeiro-acesso card">
      <h1>Crie sua senha</h1>
      <p class="texto-muted">
        Olá, {{ nome }}. Você entrou com a senha provisória enviada pelo RH.
        Para sua segurança, defina uma senha que só você conheça antes de continuar.
      </p>
      <app-trocar-senha rotuloAtual="Senha provisória" textoBotao="Definir minha senha" (concluido)="seguir()" />
      <button type="button" class="link-voltar" (click)="sair()">Sair e fazer isso depois</button>
    </main>
  `,
  styles: `
    :host { display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100%; padding: 1.5rem; }
    .primeiro-acesso { width: 100%; max-width: 440px; }
    h1 { color: var(--primary-color); font-size: 1.4rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1.5rem; }
    .link-voltar { margin-top: 1rem; background: none; border: none; color: var(--text-muted); cursor: pointer; text-decoration: underline; }
  `,
})
export class PrimeiroAcesso {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacao = inject(NotificacaoService);
  readonly nome = this.auth.usuario()?.nome ?? '';

  seguir(): void {
    const usuario = this.auth.usuario()!;
    this.notificacao.sucesso('Senha criada. Bem-vindo(a) ao Lobios!');
    this.router.navigateByUrl(this.auth.rotaInicial(usuario.perfil));
  }

  async sair(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
