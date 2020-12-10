import { TestBed } from '@angular/core/testing';

import { ScenceViewService } from './scence-view.service';

describe('ScenceViewService', () => {
  let service: ScenceViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScenceViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
