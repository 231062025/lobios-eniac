import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

export interface dadosLogin {
  login: string,
  senha: string,
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project');

  dadosLogin: dadosLogin = {
    login: '',
    senha: ''
  };

  mensagemErro: string = '';

  constructor(private authService: AuthService, private router: Router) {};

  Validador(): void {
    console.log('Dados do Formulário: ', this.dadosLogin);

    this.authService.fazerLogin(this.dadosLogin).subscribe({
      next: (resposta: any) => {
        // O Supabase não lança erro de rede em credencial errada —
        // o erro vem DENTRO da resposta, então precisa checar aqui.
        if (resposta.error) {
          console.log('Login falhou: ', resposta.error.message);
          this.mensagemErro = 'E-mail ou senha inválidos.';
          return;
        }

        console.log('Login com sucesso!', resposta.data);
        this.mensagemErro = '';

        const userId = resposta.data.user.id;

        // Com o login confirmado, busca o tipo_perfil pra saber
        // pra qual área da plataforma mandar a pessoa
        this.authService.buscarPerfil(userId).subscribe({
          next: (perfilResposta: any) => {
            if (perfilResposta.error || !perfilResposta.data) {
              console.log('Não foi possível carregar o perfil: ', perfilResposta.error);
              this.mensagemErro = 'Login feito, mas não foi possível carregar seu perfil.';
              return;
            }

            const tipoPerfil = perfilResposta.data.tipo_perfil;
            console.log('Perfil encontrado: ', tipoPerfil);

            switch (tipoPerfil) {
              case 'rh':
                this.router.navigate(['/rh']);
                break;
              case 'gestor':
                this.router.navigate(['/gestor']);
                break;
              case 'colaborador':
              default:
                this.router.navigate(['/colaborador']);
                break;
            }
          },
          error: (erro: any) => {
            console.log('Erro ao buscar perfil: ', erro);
            this.mensagemErro = 'Login feito, mas houve erro ao carregar seu perfil.';
          }
        });
      },
      error: (erro: any) => {
        // Esse bloco só roda em falha de rede/conexão, não em senha errada
        console.log('Erro na requisição: ', erro);
        this.mensagemErro = 'Erro ao conectar com o servidor.';
      }
    });
  }
}
