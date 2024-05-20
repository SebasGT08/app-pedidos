import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPedidoPage } from './add-pedido.page';

describe('AddPedidoPage', () => {
  let component: AddPedidoPage;
  let fixture: ComponentFixture<AddPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
