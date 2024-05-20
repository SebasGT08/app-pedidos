import { TestBed } from '@angular/core/testing';

import { SyncPendientesService } from './sync-pendientes.service';

describe('SyncPendientesService', () => {
  let service: SyncPendientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncPendientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
