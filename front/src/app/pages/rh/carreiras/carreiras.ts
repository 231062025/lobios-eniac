import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanoCarreira } from '../../../core/api/api.models';
import { PlanosCarreiraApi } from '../../../core/api/services';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';

@Component({
  selector: 'app-carreiras',
  imports: [FormsModule, Carregando, DataBrPipe],
  templateUrl: './carreiras.html',
})
export class Carreiras {
  private readonly api = inject(PlanosCarreiraApi);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly lista = signal<PlanoCarreira[]>([]);
  readonly carregando = signal(true);
  readonly editando = signal<string | null>(null);
  rascunho = { usuario_id: '', cargo_objetivo_id: '', previsao: '', requisitos: '' };

  /** Pessoas que ainda não têm plano (para o select de "novo plano"). */
  readonly semPlano = computed(() => {
    const comPlano = new Set(this.lista().map(p => p.usuario_id));
    return this.cadastros.usuarios().filter(u => !comPlano.has(u.id));
  });

  constructor() {
    this.api.listar({ limit: 500 }).subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  qtdRequisitos(p: PlanoCarreira): number {
    return (p.requisitos ?? '').split('\n').filter(l => l.trim()).length;
  }

  novo(): void { this.rascunho = { usuario_id: '', cargo_objetivo_id: '', previsao: '', requisitos: '' }; this.editando.set('novo'); }

  editar(p: PlanoCarreira): void {
    this.rascunho = { usuario_id: p.usuario_id, cargo_objetivo_id: p.cargo_objetivo_id ?? '', previsao: p.previsao ?? '', requisitos: p.requisitos ?? '' };
    this.editando.set(p.id);
  }

  salvar(): void {
    const r = this.rascunho;
    const id = this.editando();
    if (id === 'novo' && !r.usuario_id) return this.notificacao.erro('Escolha a pessoa.');
    if (!r.cargo_objetivo_id) return this.notificacao.erro('Escolha o cargo objetivo.');
    const dados = { cargo_objetivo_id: r.cargo_objetivo_id, previsao: r.previsao || null, requisitos: r.requisitos };
    const req = id === 'novo' ? this.api.criar({ usuario_id: r.usuario_id, ...dados }) : this.api.atualizar(id!, dados);
    req.subscribe({
      next: salvo => {
        this.lista.update(l => (id === 'novo' ? [...l, salvo] : l.map(p => (p.id === id ? salvo : p))));
        this.editando.set(null);
        this.notificacao.sucesso(`Plano de ${this.cadastros.nomeUsuario(salvo.usuario_id)} salvo.`);
      },
      error: e => this.notificacao.erro(e),
    });
  }

  excluir(p: PlanoCarreira): void {
    if (!confirm(`Excluir o plano de ${this.cadastros.nomeUsuario(p.usuario_id)}?`)) return;
    this.api.excluir(p.id).subscribe({
      next: () => { this.lista.update(l => l.filter(x => x.id !== p.id)); this.notificacao.sucesso('Plano excluído.'); },
      error: e => this.notificacao.erro(e),
    });
  }
}
