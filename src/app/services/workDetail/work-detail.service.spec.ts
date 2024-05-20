import { TestBed } from '@angular/core/testing';

import { WorkDetailService } from './work-detail.service';

describe('WorkDetailService', () => {
  let service: WorkDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
