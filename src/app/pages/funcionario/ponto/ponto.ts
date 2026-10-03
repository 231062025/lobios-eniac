import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { PontoService, RegistroPonto as Registro } from '../../../core/dados/ponto.service';
import { mensagemFirebase } from '../../../core/firebase';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

@Component({
  selector: 'app-registro-ponto',
  imports: [FormsModule, DatePipe, Carregando],
  templateUrl: './ponto.html',
})
export class RegistroPonto {
  private readonly auth = inject(AuthService);
  readonly ponto = inject(PontoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly usuarioId = this.auth.usuario()!.id;

  readonly registros = signal<Registro[]>([]);
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly ultimaMarcacao = computed(() => this.registros().find(r => r.tipo !== 'justificativa'));
  readonly proximo = computed<'entrada' | 'saida'>(() => (this.ultimaMarcacao()?.tipo === 'entrada' ? 'saida' : 'entrada'));

  observacao = '';
  anexo: File | null = null;

  constructor() { this.carregar(); }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      this.registros.set(await this.ponto.doUsuario(this.usuarioId));
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
    } finally {
      this.carregando.set(false);
    }
  }

  async registrar(tipo: 'entrada' | 'saida'): Promise<void> {
    await this.salvar({ usuarioId: this.usuarioId, tipo }, tipo === 'entrada' ? 'Entrada registrada.' : 'Saída registrada.');
  }

  selecionarArquivo(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    if (arquivo && arquivo.size > 10 * 1024 * 1024) {
      this.notificacao.erro('O arquivo passa de 10 MB.');
      (evento.target as HTMLInputElement).value = '';
      this.anexo = null;
      return;
    }
    this.anexo = arquivo;
  }

  async enviarJustificativa(form: NgForm): Promise<void> {
    if (!this.observacao.trim() && !this.anexo) {
      this.notificacao.erro('Escreva o motivo ou anexe um documento.');
      return;
    }
    const ok = await this.salvar(
      { usuarioId: this.usuarioId, tipo: 'justificativa', observacao: this.observacao.trim(), arquivo: this.anexo },
      'Justificativa enviada.',
    );
    if (ok) {
      this.observacao = '';
      this.anexo = null;
      form.resetForm();
    }
  }

  private async salvar(dados: Parameters<PontoService['registrar']>[0], mensagem: string): Promise<boolean> {
    this.enviando.set(true);
    try {
      const novo = await this.ponto.registrar(dados);
      this.registros.update(l => [novo, ...l]);
      this.notificacao.sucesso(mensagem);
      return true;
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
      return false;
    } finally {
      this.enviando.set(false);
    }
  }
}
