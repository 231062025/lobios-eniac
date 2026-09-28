import { Routes } from '@angular/router';
import { FuncionarioComponent } from './funcionario.component';
import { GestorComponent } from './gestor.component';
import { RhComponent } from './rh.component';

export const routes: Routes = [
  { path: 'funcionario', component: FuncionarioComponent },
  { path: 'gestor', component: GestorComponent },
  { path: 'rh', component: RhComponent },
];
