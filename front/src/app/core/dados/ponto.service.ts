import { Injectable, inject, signal } from '@angular/core';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { Uuid } from '../api/api.models';
import { AuthService } from '../auth.service';
import type { Firestore } from 'firebase/firestore';
import { firestorePara } from '../firebase';
import { gravar, ler } from './armazenamento';

/**
 * Ponto no Firestore:
 *   ponto        { usuario_id, tipo, data_hora, observacao, documento_id, documento_nome }
 *   documentos   { usuario_id, nome_arquivo, tipo_arquivo, tamanho_bytes, origem, criado_em, arquivo_url }
 *
 * O ARQUIVO em si ainda não é enviado (o Firebase Storage exige o plano Blaze).
 * Fica registrado só o nome/tipo/tamanho; arquivo_url = null até decidirem onde guardar.
 */
export interface RegistroPonto {
  id: string;
  usuarioId: Uuid;
  tipo: 'entrada' | 'saida' | 'justificativa';
  dataHora: Date;
  observacao?: string;
  documentoNome?: string;
}

@Injectable({ providedIn: 'root' })
export class PontoService {
  private readonly auth = inject(AuthService);
  readonly usandoFirestore = signal(false);

  async doUsuario(usuarioId: Uuid): Promise<RegistroPonto[]> {
    let lista: RegistroPonto[];
    const db = await this.remoto();
    if (db) {
      // Ordenação feita aqui no front para não exigir índice composto no Firestore.
      const q = query(collection(db, 'ponto'), where('usuario_id', '==', usuarioId));
      lista = (await getDocs(q)).docs.map(d => {
        const x = d.data();
        return {
          id: d.id,
          usuarioId: x['usuario_id'],
          tipo: x['tipo'],
          dataHora: x['data_hora']?.toDate?.() ?? new Date(),
          observacao: x['observacao'] || undefined,
          documentoNome: x['documento_nome'] || undefined,
        } as RegistroPonto;
      });
    } else {
      lista = this.local().filter(r => r.usuarioId === usuarioId);
    }
    return lista.sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
  }

  async registrar(r: { usuarioId: Uuid; tipo: RegistroPonto['tipo']; observacao?: string; arquivo?: File | null }): Promise<RegistroPonto> {
    const novo: RegistroPonto = {
      id: crypto.randomUUID(), usuarioId: r.usuarioId, tipo: r.tipo, dataHora: new Date(),
      observacao: r.observacao || undefined, documentoNome: r.arquivo?.name,
    };

    const db = await this.remoto();
    if (db) {
      let documentoId: string | null = null;
      if (r.arquivo) {
        const docRef = await addDoc(collection(db, 'documentos'), {
          usuario_id: r.usuarioId,
          nome_arquivo: r.arquivo.name,
          tipo_arquivo: r.arquivo.type || null,
          tamanho_bytes: r.arquivo.size,
          origem: 'ponto',
          criado_em: serverTimestamp(),
          arquivo_url: null,
        });
        documentoId = docRef.id;
      }
      const ref = await addDoc(collection(db, 'ponto'), {
        usuario_id: r.usuarioId,
        tipo: r.tipo,
        data_hora: serverTimestamp(),
        observacao: r.observacao || null,
        documento_id: documentoId,
        documento_nome: r.arquivo?.name ?? null,
      });
      return { ...novo, id: ref.id };
    }

    gravar('lobios.ponto', [...this.local(), novo]);
    return novo;
  }

  /** Firestore se houver sessão do Firebase para este usuário; null no modo demonstração. */
  private async remoto(): Promise<Firestore | null> {
    const usuario = this.auth.usuario();
    const db = usuario ? await firestorePara(usuario.id) : null;
    this.usandoFirestore.set(!!db);
    return db;
  }

  private local(): RegistroPonto[] {
    return ler<RegistroPonto[]>('lobios.ponto', []).map(r => ({ ...r, dataHora: new Date(r.dataHora) }));
  }
}
