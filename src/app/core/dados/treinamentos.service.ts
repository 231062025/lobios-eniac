import { Injectable, inject, signal } from '@angular/core';
import {
  addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore';
import { Avaliacao, Uuid } from '../api/api.models';
import { AuthService } from '../auth.service';
import type { Firestore } from 'firebase/firestore';
import { firestorePara } from '../firebase';
import { gravar, ler } from './armazenamento';

/**
 * Treinamentos no Firestore (coleções criadas pelo grupo):
 *
 *   treinamentos             { titulo, carga_horaria, categoria, cargo_relacionado_id, video_url }
 *   progresso_treinamentos   { usuario_id, treinamento_id, progresso, status, data_conclusao }
 *   matriz_treinamentos      { metodo, nota_minima, treinamento_ids[] }   <- nova (regras de recomendação)
 *
 * Sem login real (modo demonstração) tudo funciona igual, mas salvo no navegador.
 */
export interface Curso {
  id: string;
  titulo: string;
  cargaHoraria: number;
  categoria: string;
  cargoRelacionadoId: string | null;
  videoUrl: string | null;
}

export interface Progresso {
  id: string;
  usuarioId: Uuid;
  treinamentoId: string;
  progresso: number;            // 0 a 100
  status: 'em_andamento' | 'concluido' | string;
  dataConclusao: Date | null;
}

/** Avaliação no método X com nota abaixo do mínimo -> recomenda os cursos. */
export interface RegraMatriz { id: string; metodo: string; notaMinima: number; cursoIds: string[]; }

const COL_CURSOS = 'treinamentos';
const COL_PROGRESSO = 'progresso_treinamentos';
const COL_MATRIZ = 'matriz_treinamentos';

const CATALOGO_DEMO: Curso[] = [
  { id: 'c1', titulo: 'Gestão do tempo e priorização', cargaHoraria: 8, categoria: 'produtividade', cargoRelacionadoId: null, videoUrl: null },
  { id: 'c2', titulo: 'Atendimento e resolução de chamados', cargaHoraria: 12, categoria: 'técnico', cargoRelacionadoId: null, videoUrl: null },
  { id: 'c3', titulo: 'Fundamentos de gestão de projetos', cargaHoraria: 20, categoria: 'gestão', cargoRelacionadoId: null, videoUrl: null },
  { id: 'c4', titulo: 'Comunicação Assertiva', cargaHoraria: 2, categoria: 'soft skills', cargoRelacionadoId: null, videoUrl: null },
];
const MATRIZ_DEMO: RegraMatriz[] = [
  { id: 'r1', metodo: 'horas', notaMinima: 7, cursoIds: ['c1'] },
  { id: 'r2', metodo: 'chamados', notaMinima: 7, cursoIds: ['c2'] },
  { id: 'r3', metodo: 'projetos', notaMinima: 7, cursoIds: ['c3'] },
  { id: 'r4', metodo: 'competencias', notaMinima: 7, cursoIds: ['c4'] },
];

@Injectable({ providedIn: 'root' })
export class TreinamentosService {
  private readonly auth = inject(AuthService);

  readonly catalogo = signal<Curso[]>([]);
  readonly matriz = signal<RegraMatriz[]>([]);
  /** true = dados vêm do Firestore; false = do navegador (modo demonstração). */
  readonly usandoFirestore = signal(false);

  curso(id: string): Curso | undefined { return this.catalogo().find(c => c.id === id); }

  // ---------------------------------------------------------------- catálogo e matriz
  async carregar(): Promise<void> {
    const db = await this.remoto();
    if (db) {
      const cursos = await getDocs(collection(db, COL_CURSOS));
      this.catalogo.set(cursos.docs.map(d => paraCurso(d.id, d.data())).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')));
      try {
        const regras = await getDocs(collection(db, COL_MATRIZ));
        this.matriz.set(regras.docs.map(d => paraRegra(d.id, d.data())));
      } catch {
        this.matriz.set([]); // regra ainda não liberada no Firestore
      }
    } else {
      this.catalogo.set(ler('lobios.cursos', CATALOGO_DEMO));
      this.matriz.set(ler('lobios.matriz', MATRIZ_DEMO));
    }
  }

  async adicionarCurso(dados: Omit<Curso, 'id'>): Promise<void> {
    let novo: Curso;
    const db = await this.remoto();
    if (db) {
      const ref = await addDoc(collection(db, COL_CURSOS), {
        titulo: dados.titulo,
        carga_horaria: dados.cargaHoraria,
        categoria: dados.categoria,
        cargo_relacionado_id: dados.cargoRelacionadoId || null,
        video_url: dados.videoUrl || null,
      });
      novo = { ...dados, id: ref.id };
    } else {
      novo = { ...dados, id: crypto.randomUUID() };
    }
    this.catalogo.update(l => [...l, novo]);
    this.salvarLocal();
  }

  async removerCurso(id: string): Promise<void> {
    const db = await this.remoto();
    if (db) await deleteDoc(doc(db, COL_CURSOS, id));
    this.catalogo.update(l => l.filter(c => c.id !== id));
    // tira o curso das regras que o usavam
    for (const r of this.matriz().filter(r => r.cursoIds.includes(id))) {
      await this.salvarRegra({ ...r, cursoIds: r.cursoIds.filter(c => c !== id) });
    }
    this.salvarLocal();
  }

  async salvarRegra(regra: RegraMatriz): Promise<void> {
    const db = await this.remoto();
    if (db) {
      await setDoc(doc(db, COL_MATRIZ, regra.id), {
        metodo: regra.metodo, nota_minima: regra.notaMinima, treinamento_ids: regra.cursoIds,
      });
    }
    const existe = this.matriz().some(r => r.id === regra.id);
    this.matriz.update(l => (existe ? l.map(r => (r.id === regra.id ? regra : r)) : [...l, regra]));
    this.salvarLocal();
  }

  async removerRegra(id: string): Promise<void> {
    const db = await this.remoto();
    if (db) await deleteDoc(doc(db, COL_MATRIZ, id));
    this.matriz.update(l => l.filter(r => r.id !== id));
    this.salvarLocal();
  }

  /** Recomendação por regra (sem IA): usa a avaliação mais recente de cada método. */
  recomendar(avaliacoes: Avaliacao[]): { curso: Curso; motivo: string }[] {
    const ultimaPorMetodo = new Map<string, Avaliacao>();
    for (const a of avaliacoes) {
      if (a.metodo && a.pontuacao != null && !ultimaPorMetodo.has(a.metodo)) ultimaPorMetodo.set(a.metodo, a);
    }
    const resultado = new Map<string, { curso: Curso; motivo: string }>();
    for (const regra of this.matriz()) {
      const av = ultimaPorMetodo.get(regra.metodo);
      if (!av || av.pontuacao! >= regra.notaMinima) continue;
      for (const id of regra.cursoIds) {
        const curso = this.curso(id);
        if (curso && !resultado.has(id)) {
          resultado.set(id, { curso, motivo: `Nota ${av.pontuacao} em "${regra.metodo}" (mínimo ${regra.notaMinima})` });
        }
      }
    }
    return [...resultado.values()];
  }

  // ---------------------------------------------------------------- progresso
  async progressoDoUsuario(usuarioId: Uuid): Promise<Progresso[]> {
    const db = await this.remoto();
    if (db) {
      // Só o filtro por usuario_id: assim não precisa de índice composto.
      const q = query(collection(db, COL_PROGRESSO), where('usuario_id', '==', usuarioId));
      return (await getDocs(q)).docs.map(d => paraProgresso(d.id, d.data()));
    }
    return this.progressoLocal().filter(p => p.usuarioId === usuarioId);
  }

  async matricular(usuarioId: Uuid, treinamentoId: string): Promise<Progresso> {
    const base = { usuarioId, treinamentoId, progresso: 0, status: 'em_andamento', dataConclusao: null };
    const db = await this.remoto();
    if (db) {
      const ref = await addDoc(collection(db, COL_PROGRESSO), {
        usuario_id: usuarioId, treinamento_id: treinamentoId, progresso: 0, status: 'em_andamento', data_conclusao: null,
      });
      return { ...base, id: ref.id };
    }
    const novo: Progresso = { ...base, id: crypto.randomUUID() };
    gravar('lobios.progresso', [...this.progressoLocal(), novo]);
    return novo;
  }

  /** Atualiza a porcentagem. Em 100% marca como concluído e grava a data. */
  async atualizarProgresso(p: Progresso, valor: number): Promise<Progresso> {
    const progresso = Math.max(0, Math.min(100, Math.round(valor)));
    const concluido = progresso === 100;
    const atualizado: Progresso = {
      ...p, progresso,
      status: concluido ? 'concluido' : 'em_andamento',
      dataConclusao: concluido ? new Date() : null,
    };
    const db = await this.remoto();
    if (db) {
      await updateDoc(doc(db, COL_PROGRESSO, p.id), {
        progresso, status: atualizado.status, data_conclusao: concluido ? serverTimestamp() : null,
      });
    } else {
      gravar('lobios.progresso', this.progressoLocal().map(x => (x.id === p.id ? atualizado : x)));
    }
    return atualizado;
  }

  // ---------------------------------------------------------------- internos
  /** Firestore se houver sessão do Firebase para este usuário; null no modo demonstração. */
  private async remoto(): Promise<Firestore | null> {
    const usuario = this.auth.usuario();
    const db = usuario ? await firestorePara(usuario.id) : null;
    this.usandoFirestore.set(!!db);
    return db;
  }

  private salvarLocal(): void {
    if (this.usandoFirestore()) return;
    gravar('lobios.cursos', this.catalogo());
    gravar('lobios.matriz', this.matriz());
  }

  private progressoLocal(): Progresso[] {
    return ler<Progresso[]>('lobios.progresso', []).map(p => ({ ...p, dataConclusao: p.dataConclusao ? new Date(p.dataConclusao) : null }));
  }
}

// ---------------------------------------------------------------- conversões Firestore -> front
type Doc = Record<string, unknown>;

function texto(v: unknown): string | null { return typeof v === 'string' && v.trim() ? v : null; }
function data(v: unknown): Date | null {
  if (v && typeof (v as { toDate?: unknown }).toDate === 'function') return (v as { toDate(): Date }).toDate();
  return null; // "" ou null = ainda não concluído
}

function paraCurso(id: string, d: Doc): Curso {
  return {
    id,
    titulo: texto(d['titulo']) ?? 'Sem título',
    cargaHoraria: Number(d['carga_horaria']) || 0,
    categoria: texto(d['categoria']) ?? '',
    cargoRelacionadoId: texto(d['cargo_relacionado_id']),
    videoUrl: texto(d['video_url']),
  };
}

function paraProgresso(id: string, d: Doc): Progresso {
  return {
    id,
    usuarioId: String(d['usuario_id']),
    treinamentoId: String(d['treinamento_id']),
    progresso: Number(d['progresso']) || 0,
    status: texto(d['status']) ?? 'em_andamento',
    dataConclusao: data(d['data_conclusao']),
  };
}

function paraRegra(id: string, d: Doc): RegraMatriz {
  return {
    id,
    metodo: String(d['metodo'] ?? ''),
    notaMinima: Number(d['nota_minima']) || 0,
    cursoIds: Array.isArray(d['treinamento_ids']) ? (d['treinamento_ids'] as string[]) : [],
  };
}
