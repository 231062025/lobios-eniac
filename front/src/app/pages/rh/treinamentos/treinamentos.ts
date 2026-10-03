import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { METODOS_AVALIACAO } from '../../../core/api/api.models';
import { CadastrosService } from '../../../core/cadastros.service';
import { RegraMatriz, TreinamentosService } from '../../../core/dados/treinamentos.service';
import { mensagemFirebase } from '../../../core/firebase';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

@Component({
  selector: 'app-matriz-treinamentos',
  imports: [FormsModule, Carregando],
  templateUrl: './treinamentos.html',
})
export class MatrizTreinamentos {
  readonly treinos = inject(TreinamentosService);
  readonly cadastros = inject(CadastrosService);
  private readonly notificacao = inject(NotificacaoService);
  readonly metodos = METODOS_AVALIACAO;

  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly editandoRegra = signal<RegraMatriz | null>(null);
  novoCurso = this.cursoVazio();

  constructor() { this.carregar(); }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      await this.treinos.carregar();
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
    } finally {
      this.carregando.set(false);
    }
  }

  rotulo(v: string): string { return this.metodos.find(m => m.valor === v)?.label ?? v; }

  async adicionarCurso(): Promise<void> {
    const c = this.novoCurso;
    if (!c.titulo.trim()) return this.notificacao.erro('Dê um nome ao curso.');
    if (c.videoUrl && !/^https?:\/\//.test(c.videoUrl)) return this.notificacao.erro('O link do vídeo precisa começar com http:// ou https://');
    await this.executar(
      () => this.treinos.adicionarCurso({
        titulo: c.titulo.trim(), cargaHoraria: Number(c.cargaHoraria) || 1, categoria: c.categoria.trim(),
        cargoRelacionadoId: c.cargoRelacionadoId || null, videoUrl: c.videoUrl.trim() || null,
      }),
      'Curso adicionado ao catálogo.',
    );
    this.novoCurso = this.cursoVazio();
  }

  async removerCurso(id: string, titulo: string): Promise<void> {
    if (!confirm(`Remover "${titulo}" do catálogo? O progresso de quem já fez o curso continua guardado.`)) return;
    await this.executar(() => this.treinos.removerCurso(id), 'Curso removido.');
  }

  novaRegra(): void {
    this.editandoRegra.set({ id: crypto.randomUUID(), metodo: 'projetos', notaMinima: 7, cursoIds: [] });
  }

  editarRegra(r: RegraMatriz): void { this.editandoRegra.set({ ...r, cursoIds: [...r.cursoIds] }); }

  alternarCurso(id: string): void {
    const r = this.editandoRegra()!;
    r.cursoIds = r.cursoIds.includes(id) ? r.cursoIds.filter(c => c !== id) : [...r.cursoIds, id];
  }

  async salvarRegra(): Promise<void> {
    const r = this.editandoRegra()!;
    if (!r.cursoIds.length) return this.notificacao.erro('Escolha pelo menos um curso.');
    const ok = await this.executar(() => this.treinos.salvarRegra({ ...r, notaMinima: Number(r.notaMinima) }), 'Regra salva.');
    if (ok) this.editandoRegra.set(null);
  }

  async removerRegra(r: RegraMatriz): Promise<void> {
    if (confirm('Remover esta regra?')) await this.executar(() => this.treinos.removerRegra(r.id), 'Regra removida.');
  }

  private async executar(acao: () => Promise<void>, sucesso: string): Promise<boolean> {
    this.salvando.set(true);
    try {
      await acao();
      this.notificacao.sucesso(sucesso);
      return true;
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
      return false;
    } finally {
      this.salvando.set(false);
    }
  }

  private cursoVazio() {
    return { titulo: '', cargaHoraria: 2, categoria: '', cargoRelacionadoId: '', videoUrl: '' };
  }
}
