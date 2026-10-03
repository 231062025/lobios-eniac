import { Component, computed, inject } from '@angular/core';
import { CadastrosService } from '../../../core/cadastros.service';
import { Carregando } from '../../../shared/carregando/carregando';

/**
 * Visão da estrutura (pedido da Aline: "setores e responsáveis").
 * Setor -> responsável -> cargos -> pessoas (quando a API devolver cargo_id nos usuários).
 */
@Component({
  selector: 'app-organograma',
  imports: [Carregando],
  templateUrl: './organograma.html',
})
export class Organograma {
  readonly cadastros = inject(CadastrosService);

  readonly arvore = computed(() =>
    this.cadastros.setores().map(setor => ({
      setor,
      responsavel: this.cadastros.usuario(setor.responsavel_id),
      cargos: this.cadastros.cargosDoSetor(setor.id).map(cargo => ({
        cargo,
        pessoas: this.cadastros.usuarios().filter(u => u.cargo_id === cargo.id),
      })),
    })),
  );

  readonly cargosSemSetor = computed(() => this.cadastros.cargos().filter(c => !c.setor_id));
}
