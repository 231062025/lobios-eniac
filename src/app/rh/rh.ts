import { Component, signal } from '@angular/core';

type Secao = 'estrutura' | 'competencias' | 'alertas';

interface Setor {
  nome: string;
  cargo: string;
  responsavel: string;
}

interface AlertaFerias {
  nivel: 'critico' | 'preventivo';
  titulo: string;
  rotulo: string; // "Servidor" ou "Servidora"
  servidor: string;
  matricula: number;
  detalhe: string;
}

interface Treinamento {
  metrica: string;
  curso: string;
}

@Component({
  selector: 'app-rh',
  templateUrl: './rh.html',
  styleUrl: './rh.css',
})
export class Rh {
  secaoAtiva = signal<Secao>('estrutura');

  setores: Setor[] = [
    {
      nome: 'Gabinete de Governança Digital',
      cargo: 'Secretário Adjunto',
      responsavel: 'Dr. Alberto Malta',
    },
    {
      nome: 'Coordenadoria de Auditoria Interna',
      cargo: 'Auditor Geral Titular',
      responsavel: 'Dra. Heloísa Pires',
    },
  ];

  alertas: AlertaFerias[] = [
    {
      nivel: 'critico',
      titulo: 'Risco de Notificação de Multa',
      rotulo: 'Servidor',
      servidor: 'Fernando Mendes',
      matricula: 9482,
      detalhe: '2 Períodos de férias acumulados. Notificação enviada à chefia imediata.',
    },
    {
      nivel: 'preventivo',
      titulo: 'Alerta Prévio Preventivo',
      rotulo: 'Servidora',
      servidor: 'Cláudia Regina',
      matricula: 3812,
      detalhe: 'Período concessivo vence em 60 dias. Sugerida inclusão na escala emergencial.',
    },
  ];

  treinamentos: Treinamento[] = [
    {
      metrica: 'Baixo Rendimento em Orçamento Público',
      curso: 'Planejamento e Execução Orçamentária no SIAFI (Exclusivo Enap)',
    },
    {
      metrica: 'Pontuação Crítica em Atendimento ao Usuário',
      curso: 'Ouvidoria Pública e Resolução Conflituosa de Interesses',
    },
  ];

  /** Marca o item do menu e rola a tela até a seção escolhida. */
  irPara(secao: Secao, elemento: HTMLElement): void {
    this.secaoAtiva.set(secao);
    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
