import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GestorComponent } from './gestor.component'; // Verifique o nome correto do arquivo e classe

describe('GestorComponent', () => {
  let component: GestorComponent;
  let fixture: ComponentFixture<GestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorComponent], // Se for um Standalone Component
      providers: [
        provideRouter([]) // Fornece o suporte a rotas necessárias pelo routerLink/router-outlet
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});