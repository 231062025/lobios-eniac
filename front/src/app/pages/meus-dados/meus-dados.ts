import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LABEL_PERFIL } from '../../core/api/api.models';
import { UsuariosApi } from '../../core/api/services';
import { AuthService } from '../../core/auth.service';
import { CadastrosService } from '../../core/cadastros.service';
import { NotificacaoService } from '../../core/notificacao.service';
import { TrocarSenha } from '../../shared/trocar-senha/trocar-senha';

/** Tela compartilhada pelos três perfis: PUT /users/{id} com nome e e-mail. */
@Component({
  selector: 'app-meus-dados',
  imports: [FormsModule, TrocarSenha],
  template: `
    <header>
      <h2>Meus dados</h2>
      <p class="texto-muted">Perfil de acesso: {{ perfil }}</p>
    </header>
    <div class="dashboard-grid">
    <section class="card">
      <h3>Informações pessoais</h3>
      <form (ngSubmit)="salvar()">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input id="nome" name="nome" class="form-control" [(ngModel)]="nome" required minlength="2">
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" class="form-control" [(ngModel)]="email" required>
        </div>
        <button type="submit" class="btn" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : 'Salvar alterações' }}</button>
      </form>
    </section>
    <section class="card">
      <h3>Senha de acesso</h3>
      <p class="texto-muted" style="margin-bottom: 1rem;">Troque sua senha sempre que achar necessário. Você vai precisar da senha atual.</p>
      <app-trocar-senha />
    </section>
    </div>
  `,
})
export class MeusDados {
  private readonly auth = inject(AuthService);
  private readonly api = inject(UsuariosApi);
  private readonly notificacao = inject(NotificacaoService);
  private readonly cadastros = inject(CadastrosService);

  readonly perfil = LABEL_PERFIL[this.auth.usuario()!.perfil];
  nome = this.auth.usuario()!.nome;
  email = this.auth.usuario()!.email;
  readonly salvando = signal(false);

  salvar(): void {
    if (this.nome.trim().length < 2) return this.notificacao.erro('O nome precisa ter pelo menos 2 letras.');
    this.salvando.set(true);
    this.api.atualizar(this.auth.usuario()!.id, { nome: this.nome, email: this.email }).subscribe({
      next: u => {
        this.auth.atualizarSessao({ nome: u.nome, email: u.email });
        this.cadastros.recarregar();
        this.salvando.set(false);
        this.notificacao.sucesso('Dados atualizados.');
      },
      error: e => { this.salvando.set(false); this.notificacao.erro(e); },
    });
  }
}
