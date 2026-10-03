import { Component, inject } from '@angular/core';
import { NotificacaoService } from '../../core/notificacao.service';

@Component({
  selector: 'app-notificacoes',
  template: `
    <div class="notificacoes" aria-live="polite">
      @for (n of servico.lista(); track n.id) {
        <div class="notificacao" [class.notificacao--erro]="n.tipo === 'erro'">
          <span>{{ n.texto }}</span>
          <button type="button" aria-label="Fechar aviso" (click)="servico.fechar(n.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class Notificacoes {
  readonly servico = inject(NotificacaoService);
}
