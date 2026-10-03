import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Avaliacao, Criterio, METODOS_AVALIACAO } from '../../../core/api/api.models';
import { AvaliacoesApi, CriteriosApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

interface Rascunho {
  id: string | null;      // null = nova
  usuario_id: string;
  metodo: string;
  periodo: string;
  pontuacao: number | null;
  comentarios: string;
}

@Component({
  selector: 'app-avaliacoes-equipe',
  imports: [FormsModule, Carregando],
  templateUrl: './avaliacoes.html',
})
export class AvaliacoesEquipe {
  private readonly api = inject(AvaliacoesApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly metodos = METODOS_AVALIACAO;
  readonly lista = signal<Avaliacao[]>([]);
  readonly criterios = signal<Criterio[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly filtroPessoa = signal('');
  readonly equipe = computed(() => this.cadastros.equipeDe(this.auth.usuario()!.id));
  rascunho: Rascunho = this.vazio();

  readonly visiveis = computed(() => {
    const ids = new Set(this.equipe().map(u => u.id));
    const filtro = this.filtroPessoa();
    return this.lista()
      .filter(a => ids.has(a.usuario_id) && (!filtro || a.usuario_id === filtro))
      .reverse();
  });

  /** Critérios cadastrados pelo RH para o método escolhido (dica no formulário). */
  readonly dicas = computed(() => this.criterios());

  constructor() {
    forkJoin({ avaliacoes: this.api.listar({ limit: 1000 }), criterios: inject(CriteriosApi).listar() }).subscribe({
      next: r => { this.lista.set(r.avaliacoes); this.criterios.set(r.criterios); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  criteriosDoMetodo(metodo: string): Criterio[] {
    return this.criterios().filter(c => c.metodo === metodo);
  }

  rotuloMetodo(v?: string | null): string { return this.metodos.find(m => m.valor === v)?.label ?? v ?? '—'; }

  editar(a: Avaliacao): void {
    this.rascunho = {
      id: a.id, usuario_id: a.usuario_id, metodo: a.metodo ?? 'projetos',
      periodo: a.periodo ?? '', pontuacao: a.pontuacao ?? null, comentarios: a.comentarios ?? '',
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao(): void { this.rascunho = this.vazio(); }

  salvar(): void {
    const r = this.rascunho;
    if (!r.usuario_id) return this.notificacao.erro('Escolha quem está sendo avaliado.');
    if (r.pontuacao === null || r.pontuacao < 0 || r.pontuacao > 10) return this.notificacao.erro('A nota vai de 0 a 10.');

    this.salvando.set(true);
    const dados = { metodo: r.metodo, periodo: r.periodo, pontuacao: Number(r.pontuacao), comentarios: r.comentarios };
    const req = r.id
      ? this.api.atualizar(r.id, dados)
      : this.api.criar({ ...dados, usuario_id: r.usuario_id, avaliador_id: this.auth.usuario()!.id });

    req.subscribe({
      next: salva => {
        this.lista.update(l => (r.id ? l.map(a => (a.id === r.id ? salva : a)) : [...l, salva]));
        this.notificacao.sucesso(r.id ? 'Avaliação atualizada.' : `Avaliação de ${this.cadastros.nomeUsuario(r.usuario_id)} registrada.`);
        this.rascunho = this.vazio();
        this.salvando.set(false);
      },
      error: e => { this.salvando.set(false); this.notificacao.erro(e); },
    });
  }

  excluir(a: Avaliacao): void {
    if (!confirm(`Excluir a avaliação de ${this.cadastros.nomeUsuario(a.usuario_id)}?`)) return;
    this.api.excluir(a.id).subscribe({
      next: () => { this.lista.update(l => l.filter(x => x.id !== a.id)); this.notificacao.sucesso('Avaliação excluída.'); },
      error: e => this.notificacao.erro(e),
    });
  }

  private vazio(): Rascunho {
    const d = new Date();
    return { id: null, usuario_id: '', metodo: 'projetos', periodo: `${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}`, pontuacao: null, comentarios: '' };
  }
}
