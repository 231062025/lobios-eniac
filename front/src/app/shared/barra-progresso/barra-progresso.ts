import { Component, input } from '@angular/core';

/** <app-barra-progresso [valor]="75" cor="var(--secondary-color)" /> */
@Component({
  selector: 'app-barra-progresso',
  template: `
    <div class="progress-bar-container">
      <div class="progress-bar" [style.width.%]="valor()" [style.background]="cor()"></div>
    </div>
  `,
})
export class BarraProgresso {
  readonly valor = input(0);
  readonly cor = input('var(--accent-color)');
}
