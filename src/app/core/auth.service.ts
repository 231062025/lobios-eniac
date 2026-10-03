import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Perfil, Usuario } from './api/api.models';
import { UsuariosApi } from './api/services';
import { UsuarioLogado } from './models';
import { entrarNoFirebase, sairDoFirebase } from './firebase';
import { supabase } from './supabase';

const CHAVE_SESSAO = 'lobios.usuario';

/**
 * Login em dois modos (ver environments/environment.ts):
 *
 * 1. Supabase Auth (anon key preenchida)
 *    signInWithPassword -> lê id, nome e tipo_perfil da tabela `usuarios`.
 *    A API ainda não tem rota de login nem devolve tipo_perfil no GET /users,
 *    por isso o perfil vem direto do Supabase (protegido pela RLS).
 *
 * 2. Demonstração (anon key vazia)
 *    Procura o e-mail em GET /users/ e usa o perfil escolhido na tela.
 *    Serve para apresentar e testar a integração com a API antes do login real.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly _usuario = signal<UsuarioLogado | null>(this.lerSessao());

  readonly usuario = this._usuario.asReadonly();
  readonly logado = computed(() => this._usuario() !== null);
  readonly modoDemo = supabase === null;

  /** Lança Error com mensagem amigável quando não consegue entrar. */
  async login(email: string, senha: string, perfilDemo: Perfil = 'colaborador'): Promise<UsuarioLogado> {
    const usuario = this.modoDemo
      ? await this.loginDemo(email, perfilDemo)
      : await this.loginSupabase(email, senha);

    this._usuario.set(usuario);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    return usuario;
  }

  async logout(): Promise<void> {
    this._usuario.set(null);
    sessionStorage.removeItem(CHAVE_SESSAO);
    await sairDoFirebase();
    if (supabase) await supabase.auth.signOut();
  }

  /** Atualiza nome/e-mail na sessão depois de editar "Meus dados". */
  atualizarSessao(dados: Partial<Pick<UsuarioLogado, 'nome' | 'email'>>): void {
    const atual = this._usuario();
    if (!atual) return;
    const novo = { ...atual, ...dados };
    this._usuario.set(novo);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(novo));
  }

  /**
   * Troca a senha no Supabase Auth.
   * 1) confere a senha atual (fazendo login de novo com ela);
   * 2) grava a nova senha e marca senha_definida = true nos metadados.
   * Não passa pela API: a senha não fica na tabela usuarios.
   */
  async trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    const usuario = this._usuario();
    if (!usuario) throw new Error('Sessão expirada. Entre novamente.');
    if (!supabase) {
      throw new Error('No modo demonstração não há senha para trocar. Configure a supabaseAnonKey para usar o login real.');
    }

    const { error: erroAtual } = await supabase.auth.signInWithPassword({ email: usuario.email, password: senhaAtual });
    if (erroAtual) throw new Error('A senha atual está incorreta.');

    const { error } = await supabase.auth.updateUser({ password: novaSenha, data: { senha_definida: true } });
    if (error) throw new Error(traduzirErroSenha(error.message));

    const atualizado = { ...usuario, precisaTrocarSenha: false };
    this._usuario.set(atualizado);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(atualizado));
  }

  /** Token JWT do Supabase, enviado à API no header Authorization (ver auth.interceptor.ts). */
  async token(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  rotaInicial(perfil: Perfil): string {
    const rotas: Record<Perfil, string> = { rh: '/rh', gestor: '/gestor', colaborador: '/funcionario' };
    return rotas[perfil];
  }

  // ---------------------------------------------------------------------------

  private async loginSupabase(email: string, senha: string): Promise<UsuarioLogado> {
    const { data, error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error || !data.user) throw new Error('E-mail ou senha inválidos.');

    const { data: linha, error: erroPerfil } = await supabase!
      .from('usuarios')
      .select('id, nome, email, tipo_perfil')
      .eq('id', data.user.id)
      .single();

    if (erroPerfil || !linha) {
      await supabase!.auth.signOut();
      throw new Error('Login aceito, mas o usuário não foi encontrado na tabela usuarios. Confira o trigger de sincronização.');
    }

    // Ponte para o Firebase. Se falhar, o sistema continua: só ponto e
    // treinamentos ficam salvos no navegador até o próximo login.
    try {
      await entrarNoFirebase(data.session!.access_token);
    } catch (e) {
      console.warn('[Lobios] Não foi possível entrar no Firebase:', e);
    }
    return {
      id: linha.id, nome: linha.nome, email: linha.email, perfil: linha.tipo_perfil as Perfil,
      // Marcador gravado nos metadados do Supabase Auth na primeira troca de senha.
      precisaTrocarSenha: data.user.user_metadata?.['senha_definida'] !== true,
    };
  }

  private async loginDemo(email: string, perfil: Perfil): Promise<UsuarioLogado> {
    let usuarios: Usuario[];
    try {
      usuarios = await firstValueFrom(this.usuariosApi.listar({ limit: 500 }));
    } catch {
      throw new Error('Não foi possível consultar a API. Se ela estava parada, aguarde até 1 minuto e tente de novo.');
    }
    const encontrado = usuarios.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!encontrado) throw new Error('Nenhum usuário com esse e-mail na API. Cadastre-o primeiro (POST /users).');

    return {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
      perfil: encontrado.tipo_perfil ?? perfil,
      demo: true,
    };
  }

  private lerSessao(): UsuarioLogado | null {
    try {
      const salvo = sessionStorage.getItem(CHAVE_SESSAO);
      const usuario = salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
      return usuario?.id ? usuario : null; // descarta sessões do mock antigo (sem id)
    } catch {
      return null;
    }
  }
}

function traduzirErroSenha(msg: string): string {
  if (/different from the old/i.test(msg)) return 'A nova senha precisa ser diferente da atual.';
  if (/at least/i.test(msg)) return 'A senha não atende ao tamanho mínimo configurado no Supabase.';
  if (/weak|pwned|leaked/i.test(msg)) return 'Essa senha é fraca ou já apareceu em vazamentos. Escolha outra.';
  return `Não foi possível trocar a senha: ${msg}`;
}
