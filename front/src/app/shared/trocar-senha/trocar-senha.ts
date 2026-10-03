import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

/** Regras mostradas em tempo real enquanto a pessoa digita. */
const REGRAS = [
  { texto: 'Pelo menos 8 caracteres', ok: (s: string) => s.length >= 8 },
  { texto: 'Uma letra', ok: (s: string) => /[A-Za-zÀ-ú]/.test(s) },
  { texto: 'Um número', ok: (s: string) => /\d/.test(s) },
];

/**
 * Formulário de troca de senha, usado em "Meus dados" e no primeiro acesso.
 * <app-trocar-senha textoBotao="Definir senha" (concluido)="..." />
 */
@Component({
  selector: 'app-trocar-senha',
  imports: [FormsModule],
  templateUrl: './trocar-senha.html',
})
export class TrocarSenha {
  private readonly auth = inject(AuthService);

  readonly textoBotao = input('Trocar senha');
  readonly rotuloAtual = input('Senha atual');
  readonly concluido = output<void>();

  readonly modoDemo = this.auth.modoDemo;
  readonly atual = signal('');
  readonly nova = signal('');
  readonly confirmacao = signal('');
  readonly mostrar = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');

  readonly regras = computed(() => REGRAS.map(r => ({ texto: r.texto, ok: r.ok(this.nova()) })));
  readonly confere = computed(() => !!this.confirmacao() && this.nova() === this.confirmacao());
  readonly valida = computed(() =>
    !!this.atual() && this.regras().every(r => r.ok) && this.confere() && this.nova() !== this.atual(),
  );

  async salvar(): Promise<void> {
    this.erro.set('');
    this.sucesso.set('');
    if (this.nova() === this.atual()) return this.erro.set('A nova senha precisa ser diferente da atual.');
    if (!this.valida()) return this.erro.set('Confira os requisitos da nova senha.');

    this.salvando.set(true);
    try {
      await this.auth.trocarSenha(this.atual(), this.nova());
      this.atual.set(''); this.nova.set(''); this.confirmacao.set('');
      this.sucesso.set('Senha alterada. Use a nova senha no próximo login.');
      this.concluido.emit();
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível trocar a senha.');
    } finally {
      this.salvando.set(false);
    }
  }
}
