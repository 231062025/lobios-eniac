import { Routes } from '@angular/router';
import { Gestor } from './gestor/gestor';
import { EquipeDesempenhoComponent } from './pages/equipe-desempenho/equipe-desempenho.component';
import { ValidacaoEscalasComponent } from './pages/validacao-escalas/validacao-escalas.component';
import { FeedbacksComponent } from './pages/feedbacks/feedbacks.component';
import { OrganogramaComponent } from './pages/organograma/organograma.component';

export const routes: Routes = [
  {
    // Gestor é o LAYOUT (menu lateral + cabeçalho).
    // As telas abaixo aparecem dentro do <router-outlet> dele.
    path: '',
    component: Gestor,
    children: [
      { path: '', redirectTo: 'equipe-desempenho', pathMatch: 'full' },
      { path: 'equipe-desempenho', component: EquipeDesempenhoComponent },
      { path: 'validacao-escalas', component: ValidacaoEscalasComponent },
      { path: 'feedbacks', component: FeedbacksComponent },
      { path: 'organograma', component: OrganogramaComponent },
    ],
  },
  // Qualquer URL desconhecida volta para a tela inicial
  { path: '**', redirectTo: '' },
];
