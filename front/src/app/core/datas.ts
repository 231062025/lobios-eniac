/** Utilitários de data sem fuso horário (as datas da API são 'AAAA-MM-DD'). */

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function paraData(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Dias corridos entre duas datas, contando as duas pontas. */
export function diasEntre(inicio: string, fim: string): number {
  return Math.round((paraData(fim).getTime() - paraData(inicio).getTime()) / 86_400_000) + 1;
}

export function diasAte(iso: string): number {
  return Math.round((paraData(iso).getTime() - paraData(hojeIso()).getTime()) / 86_400_000);
}

export function formatarData(iso?: string | null): string {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function pad(n: number): string { return String(n).padStart(2, '0'); }
