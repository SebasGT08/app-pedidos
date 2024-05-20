import { TestBed } from '@angular/core/testing';

import { HorarioDetailService } from './horario-detail.service';

describe('HorarioDetailService', () => {
  let service: HorarioDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorarioDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
