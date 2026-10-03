/** Leitura/escrita segura no localStorage (usado só pelos módulos ainda sem API). */
export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* navegador sem storage: segue só em memória */
  }
}
