import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rh } from './rh';

describe('Rh', () => {
  let component: Rh;
  let fixture: ComponentFixture<Rh>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rh]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rh);
    component = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one table row per setor', () => {
    expect(el.querySelectorAll('tbody tr').length).toBe(component.setores.length);
  });

  it('should render the alerts with their severity class', () => {
    expect(el.querySelectorAll('.alerta').length).toBe(component.alertas.length);
    expect(el.querySelector('.alerta--critico')).toBeTruthy();
    expect(el.querySelector('.alerta--preventivo')).toBeTruthy();
  });

  it('should mark the clicked menu item as active', () => {
    const itens = el.querySelectorAll<HTMLButtonElement>('.menu-item');
    itens[2].click();
    fixture.detectChanges();

    expect(component.secaoAtiva()).toBe('alertas');
    expect(itens[2].classList).toContain('active');
    expect(itens[0].classList).not.toContain('active');
  });
});
