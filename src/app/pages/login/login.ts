import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Perfil } from '../../core/api/api.models';
import { AuthService } from '../../core/auth.service';

/**
 * Tela de login inspirada no modelo "sign-in-card-2" (React + framer-motion),
 * recriada em Angular com CSS puro: fundo com brilhos, cartão de vidro,
 * feixes de luz percorrendo a borda e inclinação 3D seguindo o mouse.
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly modoDemo = this.auth.modoDemo;
  email = '';
  senha = '';
  perfil: Perfil = 'colaborador';
  readonly perfis: { valor: Perfil; label: string }[] = [
    { valor: 'colaborador', label: 'Colaborador' },
    { valor: 'gestor', label: 'Gestor' },
    { valor: 'rh', label: 'RH' },
  ];

  readonly erro = signal('');
  readonly entrando = signal(false);
  readonly mostrarSenha = signal(false);
  readonly focado = signal<'email' | 'senha' | null>(null);

  // Inclinação 3D do cartão (equivalente ao useMotionValue/useTransform do modelo)
  readonly rotX = signal(0);
  readonly rotY = signal(0);
  private readonly semMovimento =
    typeof matchMedia !== 'undefined' &&
    (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches);

  constructor() {
    const atual = this.auth.usuario();
    if (atual) this.router.navigateByUrl(atual.precisaTrocarSenha ? '/primeiro-acesso' : this.auth.rotaInicial(atual.perfil));
  }

  mover(evento: MouseEvent): void {
    if (this.semMovimento) return;
    const r = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    const x = evento.clientX - r.left - r.width / 2;
    const y = evento.clientY - r.top - r.height / 2;
    // mesmo intervalo do modelo: ±300px -> ±10 graus
    this.rotY.set(Math.max(-10, Math.min(10, (x / 300) * 10)));
    this.rotX.set(Math.max(-10, Math.min(10, (-y / 300) * 10)));
  }

  sair(): void {
    this.rotX.set(0);
    this.rotY.set(0);
  }

  async entrar(): Promise<void> {
    if (!this.email.trim()) {
      this.erro.set('Informe o e-mail.');
      return;
    }
    if (!this.modoDemo && !this.senha) {
      this.erro.set('Informe a senha.');
      return;
    }
    this.erro.set('');
    this.entrando.set(true);
    try {
      const usuario = await this.auth.login(this.email, this.senha, this.perfil);
      this.router.navigateByUrl(usuario.precisaTrocarSenha ? '/primeiro-acesso' : this.auth.rotaInicial(usuario.perfil));
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      this.entrando.set(false);
    }
  }
}
