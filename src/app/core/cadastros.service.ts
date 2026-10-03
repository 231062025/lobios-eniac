import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Cargo, Setor, Usuario, Uuid } from './api/api.models';
import { CargosApi, SetoresApi, UsuariosApi } from './api/services';
import { NotificacaoService } from './notificacao.service';

/**
 * Guarda em memória as listas que quase toda tela precisa (usuários, setores e cargos)
 * para transformar UUID em nome sem ficar chamando a API toda hora.
 *
 *   cadastros.nomeUsuario(id)  -> 'Mariana Costa'
 *   cadastros.usuarios()       -> lista para preencher <select>
 */
@Injectable({ providedIn: 'root' })
export class CadastrosService {
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly setoresApi = inject(SetoresApi);
  private readonly cargosApi = inject(CargosApi);
  private readonly notificacao = inject(NotificacaoService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly setores = signal<Setor[]>([]);
  readonly cargos = signal<Cargo[]>([]);
  readonly carregando = signal(false);
  private carregado = false;

  private readonly mapaUsuarios = computed(() => new Map(this.usuarios().map(u => [u.id, u])));
  private readonly mapaSetores = computed(() => new Map(this.setores().map(s => [s.id, s])));
  private readonly mapaCargos = computed(() => new Map(this.cargos().map(c => [c.id, c])));

  /** Carrega só na primeira vez. Use recarregar() depois de criar/editar algo. */
  garantir(): void {
    if (!this.carregado) this.recarregar();
  }

  recarregar(): void {
    this.carregando.set(true);
    forkJoin({
      usuarios: this.usuariosApi.listar({ limit: 500 }),
      setores: this.setoresApi.listar({ limit: 500 }),
      cargos: this.cargosApi.listar({ limit: 500 }),
    }).subscribe({
      next: r => {
        this.usuarios.set(ordenar(r.usuarios));
        this.setores.set(ordenar(r.setores));
        this.cargos.set(ordenar(r.cargos));
        this.carregado = true;
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.notificacao.erro(e, 'Falha ao carregar usuários, setores e cargos.');
      },
    });
  }

  usuario(id?: Uuid | null): Usuario | undefined { return id ? this.mapaUsuarios().get(id) : undefined; }
  nomeUsuario(id?: Uuid | null): string { return this.usuario(id)?.nome ?? (id ? 'Usuário removido' : '—'); }
  nomeSetor(id?: Uuid | null): string { return id ? this.mapaSetores().get(id)?.nome ?? 'Setor removido' : '—'; }
  cargo(id?: Uuid | null): Cargo | undefined { return id ? this.mapaCargos().get(id) : undefined; }
  nomeCargo(id?: Uuid | null): string {
    const c = this.cargo(id);
    if (!c) return id ? 'Cargo removido' : '—';
    return c.nivel ? `${c.nome} (${c.nivel})` : c.nome;
  }
  cargosDoSetor(setorId: Uuid): Cargo[] { return this.cargos().filter(c => c.setor_id === setorId); }

  /**
   * Equipe do gestor. Hoje o GET /users não devolve gestor_id, então mostra todos
   * (menos o próprio gestor). Quando a API passar a devolver, o filtro já funciona.
   */
  equipeDe(gestorId: Uuid): Usuario[] {
    const outros = this.usuarios().filter(u => u.id !== gestorId);
    const temVinculo = outros.some(u => u.gestor_id !== undefined);
    return temVinculo ? outros.filter(u => u.gestor_id === gestorId) : outros;
  }
}

function ordenar<T extends { nome: string }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
