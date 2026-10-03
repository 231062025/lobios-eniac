import { Routes } from '@angular/router';
import { perfilGuard, primeiroAcessoGuard } from './core/perfil.guard';
import { ItemMenu } from './core/models';
import { Layout } from './layout/layout';

const menuColaborador: ItemMenu[] = [
  { label: 'Painel', rota: '/funcionario' },
  { label: 'Minhas metas', rota: '/funcionario/metas' },
  { label: 'Férias', rota: '/funcionario/ferias' },
  { label: 'Avaliações e feedbacks', rota: '/funcionario/desempenho' },
  { label: 'Plano de carreira', rota: '/funcionario/carreira' },
  { label: 'Treinamentos', rota: '/funcionario/treinamentos' },
  { label: 'Registro de ponto', rota: '/funcionario/ponto' },
  { label: 'Meus dados', rota: '/funcionario/meus-dados' },
];

const menuGestor: ItemMenu[] = [
  { label: 'Equipe e desempenho', rota: '/gestor' },
  { label: 'Aprovações de férias', rota: '/gestor/aprovacoes' },
  { label: 'Avaliações', rota: '/gestor/avaliacoes' },
  { label: 'Feedbacks', rota: '/gestor/feedbacks' },
  { label: 'Metas da equipe', rota: '/gestor/metas' },
  { label: 'Organograma', rota: '/gestor/organograma' },
  { label: 'Meus dados', rota: '/gestor/meus-dados' },
];

const menuRh: ItemMenu[] = [
  { label: 'Setores e cargos', rota: '/rh' },
  { label: 'Colaboradores', rota: '/rh/colaboradores' },
  { label: 'Critérios de avaliação', rota: '/rh/criterios' },
  { label: 'Planos de carreira', rota: '/rh/carreiras' },
  { label: 'Férias da empresa', rota: '/rh/ferias' },
  { label: 'Matriz de treinamentos', rota: '/rh/treinamentos' },
  { label: 'Meus dados', rota: '/rh/meus-dados' },
];

const meusDados = () => import('./pages/meus-dados/meus-dados').then(m => m.MeusDados);

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: 'primeiro-acesso',
    title: 'Primeiro acesso | Lobios',
    canActivate: [primeiroAcessoGuard],
    loadComponent: () => import('./pages/primeiro-acesso/primeiro-acesso').then(m => m.PrimeiroAcesso),
  },

  {
    path: 'funcionario',
    component: Layout,
    canActivate: [perfilGuard('colaborador')],
    data: { marca: 'Lobios', menu: menuColaborador },
    children: [
      { path: '', title: 'Painel | Lobios', loadComponent: () => import('./pages/funcionario/painel/painel').then(m => m.PainelColaborador) },
      { path: 'metas', title: 'Minhas metas | Lobios', loadComponent: () => import('./pages/funcionario/metas/metas').then(m => m.MinhasMetas) },
      { path: 'ferias', title: 'Férias | Lobios', loadComponent: () => import('./pages/funcionario/ferias/ferias').then(m => m.MinhasFerias) },
      { path: 'desempenho', title: 'Avaliações e feedbacks | Lobios', loadComponent: () => import('./pages/funcionario/desempenho/desempenho').then(m => m.MeuDesempenho) },
      { path: 'carreira', title: 'Plano de carreira | Lobios', loadComponent: () => import('./pages/funcionario/carreira/carreira').then(m => m.MinhaCarreira) },
      { path: 'treinamentos', title: 'Treinamentos | Lobios', loadComponent: () => import('./pages/funcionario/treinamentos/treinamentos').then(m => m.MeusTreinamentos) },
      { path: 'ponto', title: 'Registro de ponto | Lobios', loadComponent: () => import('./pages/funcionario/ponto/ponto').then(m => m.RegistroPonto) },
      { path: 'meus-dados', title: 'Meus dados | Lobios', loadComponent: meusDados },
    ],
  },

  {
    path: 'gestor',
    component: Layout,
    canActivate: [perfilGuard('gestor')],
    data: { marca: 'Lobios · Gestão', menu: menuGestor },
    children: [
      { path: '', title: 'Equipe | Lobios', loadComponent: () => import('./pages/gestor/equipe/equipe').then(m => m.Equipe) },
      { path: 'aprovacoes', title: 'Aprovações | Lobios', loadComponent: () => import('./pages/gestor/aprovacoes/aprovacoes').then(m => m.Aprovacoes) },
      { path: 'avaliacoes', title: 'Avaliações | Lobios', loadComponent: () => import('./pages/gestor/avaliacoes/avaliacoes').then(m => m.AvaliacoesEquipe) },
      { path: 'feedbacks', title: 'Feedbacks | Lobios', loadComponent: () => import('./pages/gestor/feedbacks/feedbacks').then(m => m.FeedbacksEquipe) },
      { path: 'metas', title: 'Metas da equipe | Lobios', loadComponent: () => import('./pages/gestor/metas/metas').then(m => m.MetasEquipe) },
      { path: 'organograma', title: 'Organograma | Lobios', loadComponent: () => import('./pages/gestor/organograma/organograma').then(m => m.Organograma) },
      { path: 'meus-dados', title: 'Meus dados | Lobios', loadComponent: meusDados },
    ],
  },

  {
    path: 'rh',
    component: Layout,
    canActivate: [perfilGuard('rh')],
    data: { marca: 'Lobios · RH', menu: menuRh },
    children: [
      { path: '', title: 'Setores e cargos | Lobios', loadComponent: () => import('./pages/rh/estrutura/estrutura').then(m => m.Estrutura) },
      { path: 'colaboradores', title: 'Colaboradores | Lobios', loadComponent: () => import('./pages/rh/colaboradores/colaboradores').then(m => m.Colaboradores) },
      { path: 'criterios', title: 'Critérios de avaliação | Lobios', loadComponent: () => import('./pages/rh/criterios/criterios').then(m => m.Criterios) },
      { path: 'carreiras', title: 'Planos de carreira | Lobios', loadComponent: () => import('./pages/rh/carreiras/carreiras').then(m => m.Carreiras) },
      { path: 'ferias', title: 'Férias da empresa | Lobios', loadComponent: () => import('./pages/rh/ferias/ferias').then(m => m.FeriasEmpresa) },
      { path: 'treinamentos', title: 'Matriz de treinamentos | Lobios', loadComponent: () => import('./pages/rh/treinamentos/treinamentos').then(m => m.MatrizTreinamentos) },
      { path: 'meus-dados', title: 'Meus dados | Lobios', loadComponent: meusDados },
    ],
  },

  { path: '**', redirectTo: '' },
];
