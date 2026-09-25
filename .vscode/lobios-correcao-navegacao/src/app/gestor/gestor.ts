import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-gestor',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './gestor.html',
  styleUrl: './gestor.css'
})
export class Gestor {}
