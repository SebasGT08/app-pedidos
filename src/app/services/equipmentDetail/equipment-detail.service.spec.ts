import { TestBed } from '@angular/core/testing';

import { EquipmentDetailService } from './equipment-detail.service';

describe('EquipmentDetailService', () => {
  let service: EquipmentDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EquipmentDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
