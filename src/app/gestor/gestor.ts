import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppComponent } from '../app.component';
//FODA-SE easter egg
@Component({
  selector: 'app-gestor',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppComponent],
  templateUrl: './gestor.html',
  styleUrl: './gestor.css'
})
export class Gestor {

}
