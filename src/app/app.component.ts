import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RH_Lobios';
  meuFormulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.meuFormulario = this.fb.group({
      nome: ['', Validators.required],
      senha: ['', Validators.required ],
      mensagem: []
    });
  }
}

