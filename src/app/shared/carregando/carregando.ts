import { Component, OnDestroy, OnInit, signal } from '@angular/core';

/**
 * Mensagem de carregamento. Depois de 4 s avisa que a API pode estar "acordando"
 * (o plano gratuito do Render desliga a API depois de ~15 min sem uso).
 */
@Component({
  selector: 'app-carregando',
  template: `
    <p class="carregando" role="status">
      <span class="spinner" aria-hidden="true"></span>
      Carregando…
      @if (demorando()) { <small>A API pode levar até 1 minuto para responder na primeira chamada.</small> }
    </p>
  `,
})
export class Carregando implements OnInit, OnDestroy {
  readonly demorando = signal(false);
  private timer?: ReturnType<typeof setTimeout>;
  ngOnInit(): void { this.timer = setTimeout(() => this.demorando.set(true), 4000); }
  ngOnDestroy(): void { clearTimeout(this.timer); }
}
