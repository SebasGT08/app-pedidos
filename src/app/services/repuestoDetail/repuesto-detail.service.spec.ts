import { TestBed } from '@angular/core/testing';

import { RepuestoDetailService } from './repuesto-detail.service';

describe('RepuestoDetailService', () => {
  let service: RepuestoDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepuestoDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
