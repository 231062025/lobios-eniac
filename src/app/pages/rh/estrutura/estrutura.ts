import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cargo, Setor } from '../../../core/api/api.models';
import { CargosApi, SetoresApi } from '../../../core/api/services';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

const NIVEIS = ['Estagiário', 'Júnior', 'Pleno', 'Sênior', 'Coordenação', 'Gerência', 'Diretoria'];

/**
 * CRUD de setores e cargos. Repare que ninguém digita UUID:
 * os <select> mostram o nome e guardam o id no value.
 * Ordem certa: crie o setor primeiro, depois os cargos dele.
 */
@Component({
  selector: 'app-estrutura',
  imports: [FormsModule, NgTemplateOutlet, Carregando],
  templateUrl: './estrutura.html',
})
export class Estrutura {
  private readonly setoresApi = inject(SetoresApi);
  private readonly cargosApi = inject(CargosApi);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);
  readonly niveis = NIVEIS;

  // ---------- Setores ----------
  readonly editandoSetor = signal<string | null>(null);   // 'novo' | id | null
  setor = { nome: '', responsavel_id: '' };

  novoSetor(): void { this.setor = { nome: '', responsavel_id: '' }; this.editandoSetor.set('novo'); }
  editarSetor(s: Setor): void { this.setor = { nome: s.nome, responsavel_id: s.responsavel_id ?? '' }; this.editandoSetor.set(s.id); }

  salvarSetor(): void {
    const id = this.editandoSetor();
    if (!this.setor.nome.trim()) return this.notificacao.erro('Dê um nome ao setor.');
    const dados = { nome: this.setor.nome, responsavel_id: this.setor.responsavel_id || null };
    const req = id === 'novo' ? this.setoresApi.criar(dados) : this.setoresApi.atualizar(id!, dados);
    req.subscribe({
      next: salvo => {
        this.cadastros.setores.update(l => (id === 'novo' ? [...l, salvo] : l.map(s => (s.id === id ? salvo : s))));
        this.editandoSetor.set(null);
        this.notificacao.sucesso(`Setor "${salvo.nome}" salvo.`);
      },
      error: e => this.notificacao.erro(e),
    });
  }

  excluirSetor(s: Setor): void {
    const qtd = this.cadastros.cargosDoSetor(s.id).length;
    const aviso = qtd ? ` Ele tem ${qtd} cargo(s) vinculado(s); o banco pode recusar.` : '';
    if (!confirm(`Excluir o setor "${s.nome}"?${aviso}`)) return;
    this.setoresApi.excluir(s.id).subscribe({
      next: () => { this.cadastros.setores.update(l => l.filter(x => x.id !== s.id)); this.notificacao.sucesso('Setor excluído.'); },
      error: e => this.notificacao.erro(e, 'Não foi possível excluir.'),
    });
  }

  // ---------- Cargos ----------
  readonly editandoCargo = signal<string | null>(null);
  cargo = { nome: '', setor_id: '', nivel: '' };

  novoCargo(): void {
    this.cargo = { nome: '', setor_id: this.cadastros.setores()[0]?.id ?? '', nivel: 'Júnior' };
    this.editandoCargo.set('novo');
  }
  editarCargo(c: Cargo): void {
    this.cargo = { nome: c.nome, setor_id: c.setor_id ?? '', nivel: c.nivel ?? '' };
    this.editandoCargo.set(c.id);
  }

  salvarCargo(): void {
    const id = this.editandoCargo();
    if (!this.cargo.nome.trim()) return this.notificacao.erro('Dê um nome ao cargo.');
    const dados = { nome: this.cargo.nome, setor_id: this.cargo.setor_id || null, nivel: this.cargo.nivel || null };
    const req = id === 'novo' ? this.cargosApi.criar(dados) : this.cargosApi.atualizar(id!, dados);
    req.subscribe({
      next: salvo => {
        this.cadastros.cargos.update(l => (id === 'novo' ? [...l, salvo] : l.map(c => (c.id === id ? salvo : c))));
        this.editandoCargo.set(null);
        this.notificacao.sucesso(`Cargo "${salvo.nome}" salvo.`);
      },
      error: e => this.notificacao.erro(e),
    });
  }

  excluirCargo(c: Cargo): void {
    if (!confirm(`Excluir o cargo "${c.nome}"?`)) return;
    this.cargosApi.excluir(c.id).subscribe({
      next: () => { this.cadastros.cargos.update(l => l.filter(x => x.id !== c.id)); this.notificacao.sucesso('Cargo excluído.'); },
      error: e => this.notificacao.erro(e, 'Não foi possível excluir.'),
    });
  }
}
