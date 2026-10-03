import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LABEL_PERFIL, Perfil, Usuario, UsuarioAtualizar } from '../../../core/api/api.models';
import { UsuariosApi } from '../../../core/api/services';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';

interface Ficha {
  nome: string; email: string; senha: string;
  tipo_perfil: Perfil | ''; setor_id: string; cargo_id: string; gestor_id: string; data_admissao: string;
}

/**
 * Cadastro: POST /users (nome, email, senha).
 * Vínculos: PUT /users/{id} (perfil, setor, cargo, gestor, admissão).
 * Na edição só os campos preenchidos são enviados, para não apagar dados no banco.
 */
@Component({
  selector: 'app-colaboradores',
  imports: [FormsModule, Carregando],
  templateUrl: './colaboradores.html',
})
export class Colaboradores {
  private readonly api = inject(UsuariosApi);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);
  readonly perfis = Object.entries(LABEL_PERFIL) as [Perfil, string][];
  readonly labelPerfil = LABEL_PERFIL;

  readonly busca = signal('');
  readonly editando = signal<string | null>(null);  // 'novo' | id | null
  readonly salvando = signal(false);
  ficha: Ficha = this.vazia();

  readonly filtrados = computed(() => {
    const t = this.busca().trim().toLowerCase();
    return this.cadastros.usuarios().filter(u => !t || u.nome.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  });

  /** Cargos filtrados pelo setor escolhido na ficha. */
  cargosDisponiveis() {
    return this.ficha.setor_id ? this.cadastros.cargosDoSetor(this.ficha.setor_id) : this.cadastros.cargos();
  }

  novo(): void { this.ficha = this.vazia(); this.editando.set('novo'); }

  editar(u: Usuario): void {
    this.ficha = {
      nome: u.nome, email: u.email, senha: '',
      tipo_perfil: u.tipo_perfil ?? '', setor_id: u.setor_id ?? '', cargo_id: u.cargo_id ?? '',
      gestor_id: u.gestor_id ?? '', data_admissao: u.data_admissao ?? '',
    };
    this.editando.set(u.id);
  }

  salvar(): void {
    const f = this.ficha;
    if (f.nome.trim().length < 2) return this.notificacao.erro('Nome precisa ter pelo menos 2 letras.');
    if (!f.email.includes('@')) return this.notificacao.erro('Informe um e-mail válido.');
    if (this.editando() === 'novo' && f.senha && f.senha.length < 6) return this.notificacao.erro('A senha precisa ter pelo menos 6 caracteres.');

    const vinculos: UsuarioAtualizar = {
      tipo_perfil: f.tipo_perfil || undefined,
      setor_id: f.setor_id || undefined,
      cargo_id: f.cargo_id || undefined,
      gestor_id: f.gestor_id || undefined,
      data_admissao: f.data_admissao || undefined,
    };
    const temVinculos = Object.values(vinculos).some(v => v !== undefined);
    this.salvando.set(true);

    if (this.editando() === 'novo') {
      // 1) cria  2) se houver vínculos, completa com PUT (o POST só aceita nome/email/senha)
      this.api.criar({ nome: f.nome, email: f.email, senha: f.senha || null }).subscribe({
        next: criado => {
          if (!temVinculos) return this.concluir(criado, 'Colaborador cadastrado.');
          this.api.atualizar(criado.id, vinculos).subscribe({
            next: atualizado => this.concluir({ ...criado, ...vinculos, ...atualizado }, 'Colaborador cadastrado e vinculado.'),
            error: e => { this.concluir(criado, ''); this.notificacao.erro(e, 'Cadastrado, mas os vínculos falharam.'); },
          });
        },
        error: e => { this.salvando.set(false); this.notificacao.erro(e); },
      });
    } else {
      const id = this.editando()!;
      this.api.atualizar(id, { nome: f.nome, email: f.email, ...vinculos }).subscribe({
        next: atualizado => this.concluir({ ...this.cadastros.usuario(id)!, ...vinculos, ...atualizado }, 'Dados atualizados.'),
        error: e => { this.salvando.set(false); this.notificacao.erro(e); },
      });
    }
  }

  excluir(u: Usuario): void {
    if (!confirm(`Excluir ${u.nome}? Metas, férias e avaliações ligadas a essa pessoa podem impedir a exclusão.`)) return;
    this.api.excluir(u.id).subscribe({
      next: () => { this.cadastros.usuarios.update(l => l.filter(x => x.id !== u.id)); this.notificacao.sucesso(`${u.nome} excluído(a).`); },
      error: e => this.notificacao.erro(e, 'Não foi possível excluir.'),
    });
  }

  private concluir(usuario: Usuario, mensagem: string): void {
    this.cadastros.usuarios.update(l => {
      const existe = l.some(u => u.id === usuario.id);
      return (existe ? l.map(u => (u.id === usuario.id ? usuario : u)) : [...l, usuario])
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    });
    this.salvando.set(false);
    this.editando.set(null);
    if (mensagem) this.notificacao.sucesso(mensagem);
  }

  private vazia(): Ficha {
    return { nome: '', email: '', senha: '', tipo_perfil: 'colaborador', setor_id: '', cargo_id: '', gestor_id: '', data_admissao: '' };
  }
}
