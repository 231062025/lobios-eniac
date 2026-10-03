import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Avaliacao } from '../../../core/api/api.models';
import { AvaliacoesApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { Progresso, TreinamentosService } from '../../../core/dados/treinamentos.service';
import { mensagemFirebase } from '../../../core/firebase';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { BarraProgresso } from '../../../shared/barra-progresso/barra-progresso';

/**
 * Catálogo e progresso vêm do Firestore (treinamentos / progresso_treinamentos).
 * Recomendações = avaliações da API + matriz definida pelo RH.
 */
@Component({
  selector: 'app-meus-treinamentos',
  imports: [Carregando, BarraProgresso, DatePipe],
  templateUrl: './treinamentos.html',
})
export class MeusTreinamentos {
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly avaliacoesApi = inject(AvaliacoesApi);
  readonly treinos = inject(TreinamentosService);

  readonly usuarioId = this.auth.usuario()!.id;
  readonly carregando = signal(true);
  readonly salvando = signal<string | null>(null);
  readonly avaliacoes = signal<Avaliacao[]>([]);
  readonly progressos = signal<Progresso[]>([]);

  private readonly porCurso = computed(() => new Map(this.progressos().map(p => [p.treinamentoId, p])));
  readonly recomendados = computed(() => this.treinos.recomendar(this.avaliacoes()).filter(r => !this.porCurso().has(r.curso.id)));
  readonly meus = computed(() =>
    this.progressos()
      .map(p => ({ p, curso: this.treinos.curso(p.treinamentoId) }))
      .sort((a, b) => Number(a.p.status === 'concluido') - Number(b.p.status === 'concluido')),
  );
  readonly horasConcluidas = computed(() =>
    this.meus().filter(m => m.p.status === 'concluido').reduce((s, m) => s + (m.curso?.cargaHoraria ?? 0), 0),
  );

  constructor() { this.carregar(); }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const [avaliacoes] = await Promise.all([
        firstValueFrom(this.avaliacoesApi.listar({ usuario_id: this.usuarioId })).catch(() => [] as Avaliacao[]),
        this.treinos.carregar(),
      ]);
      this.avaliacoes.set([...avaliacoes].reverse()); // mais recente primeiro
      this.progressos.set(await this.treinos.progressoDoUsuario(this.usuarioId));
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
    } finally {
      this.carregando.set(false);
    }
  }

  matriculado(cursoId: string): boolean { return this.porCurso().has(cursoId); }

  async matricular(cursoId: string, titulo: string): Promise<void> {
    this.salvando.set(cursoId);
    try {
      const novo = await this.treinos.matricular(this.usuarioId, cursoId);
      this.progressos.update(l => [...l, novo]);
      this.notificacao.sucesso(`Matrícula em "${titulo}" registrada.`);
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
    } finally {
      this.salvando.set(null);
    }
  }

  async atualizar(p: Progresso, evento: Event): Promise<void> {
    const valor = Number((evento.target as HTMLInputElement).value);
    this.salvando.set(p.id);
    try {
      const novo = await this.treinos.atualizarProgresso(p, valor);
      this.progressos.update(l => l.map(x => (x.id === p.id ? novo : x)));
      if (novo.status === 'concluido') this.notificacao.sucesso('Treinamento concluído!');
    } catch (e) {
      this.notificacao.erro(mensagemFirebase(e));
    } finally {
      this.salvando.set(null);
    }
  }
}
