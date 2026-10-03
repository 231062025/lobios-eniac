import { Component, computed, input } from '@angular/core';

const ESTILOS: Record<string, { texto: string; classe: string }> = {
  solicitado: { texto: 'Aguardando', classe: 'badge-warning' },
  aprovado: { texto: 'Aprovado', classe: 'badge-success' },
  negado: { texto: 'Negado', classe: 'badge-danger' },
  em_andamento: { texto: 'Em andamento', classe: 'badge-info' },
  concluida: { texto: 'Concluída', classe: 'badge-success' },
  atrasada: { texto: 'Atrasada', classe: 'badge-danger' },
  elogio: { texto: 'Elogio', classe: 'badge-success' },
  melhoria: { texto: 'Ponto de melhoria', classe: 'badge-warning' },
};

/** <app-status [valor]="ferias.status" /> */
@Component({
  selector: 'app-status',
  template: `<span class="badge" [class]="estilo().classe">{{ estilo().texto }}</span>`,
})
export class StatusBadge {
  readonly valor = input<string | null | undefined>('');
  readonly estilo = computed(() => ESTILOS[this.valor() ?? ''] ?? { texto: this.valor() || '—', classe: 'badge-neutro' });
}
