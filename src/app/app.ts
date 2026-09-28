import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService} from './auth.service';

  export interface dadosLogin{
    login: string,
    senha: string,
  };

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project');
  
  dadosLogin: dadosLogin = {
    login: '',
    senha: ''
  };

  constructor(private authService: AuthService) {};

  Validador(): void {
    console.log('Dados do Formulário: ', this.dadosLogin); 
    
    this.authService.fazerLogin(this.dadosLogin).subscribe({
      next: (resposta: any) => {
        console.log('Login com Sucesso!', resposta);
      },
      error: (erro: any) => {
        console.log('erro na requisição: ', erro)
      }
    })
  }
}