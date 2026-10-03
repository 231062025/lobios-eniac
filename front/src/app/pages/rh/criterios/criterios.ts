import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Criterio, METODOS_AVALIACAO } from '../../../core/api/api.models';
import { CriteriosApi } from '../../../core/api/services';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

/**
 * Critérios de avaliação por cargo: define COMO cada cargo é avaliado
 * (ex.: Suporte -> chamados, peso 2; Desenvolvedor -> projetos, peso 3).
 */
@Component({
  selector: 'app-criterios',
  imports: [FormsModule, Carregando],
  templateUrl: './criterios.html',
})
export class Criterios {
  private readonly api = inject(CriteriosApi);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);
  readonly metodos = METODOS_AVALIACAO;

  readonly lista = signal<Criterio[]>([]);
  readonly carregando = signal(true);
  readonly filtroCargo = signal('');
  readonly editando = signal<string | null>(null);
  rascunho = { cargo_id: '', metodo: 'projetos', peso: 1, descricao: '' };

  readonly visiveis = computed(() => {
    const f = this.filtroCargo();
    return this.lista().filter(c => !f || c.cargo_id === f);
  });

  constructor() {
    this.api.listar({ limit: 500 }).subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  rotulo(v: string): string { return this.metodos.find(m => m.valor === v)?.label ?? v; }

  novo(): void {
    this.rascunho = { cargo_id: this.filtroCargo(), metodo: 'projetos', peso: 1, descricao: '' };
    this.editando.set('novo');
  }

  editar(c: Criterio): void {
    this.rascunho = { cargo_id: c.cargo_id ?? '', metodo: c.metodo, peso: c.peso ?? 1, descricao: c.descricao ?? '' };
    this.editando.set(c.id);
  }

  salvar(): void {
    const r = this.rascunho;
    if (r.peso <= 0) return this.notificacao.erro('O peso precisa ser maior que zero.');
    const dados = { cargo_id: r.cargo_id || null, metodo: r.metodo, peso: Number(r.peso), descricao: r.descricao };
    const id = this.editando();
    const req = id === 'novo' ? this.api.criar(dados) : this.api.atualizar(id!, dados);
    req.subscribe({
      next: salvo => {
        this.lista.update(l => (id === 'novo' ? [...l, salvo] : l.map(c => (c.id === id ? salvo : c))));
        this.editando.set(null);
        this.notificacao.sucesso('Critério salvo.');
      },
      error: e => this.notificacao.erro(e),
    });
  }

  excluir(c: Criterio): void {
    if (!confirm('Excluir este critério?')) return;
    this.api.excluir(c.id).subscribe({
      next: () => { this.lista.update(l => l.filter(x => x.id !== c.id)); this.notificacao.sucesso('Critério excluído.'); },
      error: e => this.notificacao.erro(e),
    });
  }
}
