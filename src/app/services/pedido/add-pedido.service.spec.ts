import { TestBed } from '@angular/core/testing';

import { AddPedidoService } from './add-pedido.service';

describe('AddPedidoService', () => {
  let service: AddPedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddPedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
