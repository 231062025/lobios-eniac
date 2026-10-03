import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Filtros = Record<string, string | number | boolean | null | undefined>;

/**
 * Base para os services de cada recurso da API.
 * Todos os recursos do Jackson seguem o mesmo padrão:
 *
 *   GET    /recurso/            listar   (repare na barra no final)
 *   GET    /recurso/{id}        obter
 *   POST   /recurso             criar
 *   PUT    /recurso/{id}        atualizar
 *   DELETE /recurso/{id}        excluir
 *
 * Então cada service só precisa dizer qual é o "recurso".
 */
export abstract class CrudApi<T, TCriar, TAtualizar> {
  protected readonly http = inject(HttpClient);
  protected readonly base = environment.apiUrl;
  protected abstract readonly recurso: string;

  listar(filtros: Filtros = {}): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${this.recurso}/`, { params: this.params({ limit: 200, ...filtros }) });
  }

  obter(id: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${this.recurso}/${id}`);
  }

  criar(dados: TCriar): Observable<T> {
    return this.http.post<T>(`${this.base}/${this.recurso}`, limpar(dados));
  }

  /** Só manda os campos preenchidos, para não apagar no banco o que não foi editado. */
  atualizar(id: string, dados: TAtualizar): Observable<T> {
    return this.http.put<T>(`${this.base}/${this.recurso}/${id}`, limpar(dados));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.recurso}/${id}`);
  }

  protected params(filtros: Filtros): HttpParams {
    let p = new HttpParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== null && valor !== undefined && valor !== '') p = p.set(chave, String(valor));
    }
    return p;
  }
}

/** Remove campos undefined e strings vazias ('' vira "não enviado"). */
export function limpar<T>(obj: T): T {
  const saida: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === undefined || v === '') continue;
    saida[k] = typeof v === 'string' ? v.trim() : v;
  }
  return saida as T;
}
