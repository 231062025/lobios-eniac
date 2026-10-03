import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LABEL_PERFIL } from '../core/api/api.models';
import { AuthService } from '../core/auth.service';
import { CadastrosService } from '../core/cadastros.service';
import { ItemMenu } from '../core/models';

/**
 * "Casca" de cada perfil: menu lateral + <router-outlet> para as telas filhas.
 * O menu vem do `data` da rota em app.routes.ts, então para criar uma tela nova
 * basta adicionar a rota filha e um item no menu.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  private readonly dados = toSignal(this.rota.data, { initialValue: this.rota.snapshot.data });
  readonly marca = computed(() => (this.dados()['marca'] as string) ?? 'Lobios');
  readonly menu = computed(() => (this.dados()['menu'] as ItemMenu[]) ?? []);
  readonly usuario = this.auth.usuario;
  readonly perfil = computed(() => LABEL_PERFIL[this.usuario()?.perfil ?? 'colaborador']);
  readonly modoDemo = computed(() => !!this.usuario()?.demo);

  constructor() {
    inject(CadastrosService).garantir(); // pré-carrega usuários/setores/cargos
  }

  async sair(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
