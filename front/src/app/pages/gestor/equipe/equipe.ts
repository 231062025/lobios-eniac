import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Avaliacao, Ferias, Meta, METODOS_AVALIACAO, Usuario } from '../../../core/api/api.models';
import { AvaliacoesApi, FeriasApi, MetasApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { BarraProgresso } from '../../../shared/barra-progresso/barra-progresso';

interface LinhaEquipe {
  membro: Usuario;
  nota: number | null;
  periodo: string;
  metasAbertas: number;
  metasConcluidas: number;
  feriasPendentes: number;
}

/**
 * Avaliação de desempenho com métodos diferentes (pedido da Aline):
 * o gestor escolhe o método (horas, chamados, projetos...) e a tabela
 * mostra a nota mais recente de cada pessoa naquele método.
 */
@Component({
  selector: 'app-equipe',
  imports: [FormsModule, RouterLink, Carregando, BarraProgresso],
  templateUrl: './equipe.html',
})
export class Equipe {
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly metodos = METODOS_AVALIACAO;
  readonly metodo = signal<string>('projetos');
  readonly rotuloMetodo = computed(() => this.metodos.find(m => m.valor === this.metodo())?.label.toLowerCase() ?? '');
  readonly carregando = signal(true);
  private readonly avaliacoes = signal<Avaliacao[]>([]);
  private readonly metas = signal<Meta[]>([]);
  private readonly ferias = signal<Ferias[]>([]);

  readonly equipe = computed(() => this.cadastros.equipeDe(this.auth.usuario()!.id));

  readonly linhas = computed<LinhaEquipe[]>(() =>
    this.equipe().map(membro => {
      const ultima = this.avaliacoes()
        .filter(a => a.usuario_id === membro.id && a.metodo === this.metodo())
        .at(-1);
      const metas = this.metas().filter(m => m.usuario_id === membro.id);
      return {
        membro,
        nota: ultima?.pontuacao ?? null,
        periodo: ultima?.periodo ?? '',
        metasAbertas: metas.filter(m => m.status !== 'concluida').length,
        metasConcluidas: metas.filter(m => m.status === 'concluida').length,
        feriasPendentes: this.ferias().filter(f => f.usuario_id === membro.id && f.status === 'solicitado').length,
      };
    }),
  );

  readonly mediaEquipe = computed(() => {
    const notas = this.linhas().map(l => l.nota).filter((n): n is number => n !== null);
    return notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null;
  });
  readonly totalPendencias = computed(() => this.linhas().reduce((s, l) => s + l.feriasPendentes, 0));

  constructor() {
    forkJoin({
      avaliacoes: inject(AvaliacoesApi).listar({ limit: 1000 }),
      metas: inject(MetasApi).listar({ limit: 1000 }),
      ferias: inject(FeriasApi).listar({ limit: 1000 }),
    }).subscribe({
      next: r => {
        this.avaliacoes.set(r.avaliacoes);
        this.metas.set(r.metas);
        this.ferias.set(r.ferias);
        this.carregando.set(false);
      },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  percentual(nota: number | null): number { return nota === null ? 0 : Math.min(100, nota * 10); }
  cor(nota: number | null): string { return (nota ?? 0) < 7 ? 'var(--warning-color)' : 'var(--accent-color)'; }
}
