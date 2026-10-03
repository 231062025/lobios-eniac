import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Notificacoes } from './shared/notificacoes/notificacoes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notificacoes],
  template: `<router-outlet /><app-notificacoes />`,
})
export class App {}
