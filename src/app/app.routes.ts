import { Routes } from '@angular/router';
import { EquipeDesempenhoComponent } from './pages/equipe-desempenho/equipe-desempenho.component';
import { ValidacaoEscalasComponent } from './pages/validacao-escalas/validacao-escalas.component';


export const routes: Routes = [
    { path: 'equipe-desempenho', component: EquipeDesempenhoComponent },
  { path: 'validacao-escalas', component: ValidacaoEscalasComponent },
  { path: '', redirectTo: 'equipe-desempenho', pathMatch: 'full' }
];
