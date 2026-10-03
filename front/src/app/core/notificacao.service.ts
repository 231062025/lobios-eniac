import { Injectable, signal } from '@angular/core';
import { mensagemDeErro } from './api/erro-api';

export interface Notificacao { id: number; texto: string; tipo: 'sucesso' | 'erro'; }

/** Avisos rápidos no canto da tela. Uso: notificacao.sucesso('Setor salvo.') */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  readonly lista = signal<Notificacao[]>([]);
  private proximoId = 1;

  sucesso(texto: string): void { this.mostrar(texto, 'sucesso'); }

  /** Aceita o erro cru do HttpClient e traduz. */
  erro(erro: unknown, prefixo = ''): void {
    const texto = typeof erro === 'string' ? erro : mensagemDeErro(erro);
    this.mostrar(prefixo ? `${prefixo} ${texto}` : texto, 'erro', 8000);
  }

  fechar(id: number): void {
    this.lista.update(l => l.filter(n => n.id !== id));
  }

  private mostrar(texto: string, tipo: Notificacao['tipo'], ms = 4000): void {
    const id = this.proximoId++;
    this.lista.update(l => [...l, { id, texto, tipo }]);
    setTimeout(() => this.fechar(id), ms);
  }
}
