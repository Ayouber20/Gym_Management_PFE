import { TestBed } from '@angular/core/testing';

import { CoachRequest } from './coach-request';

describe('CoachRequest', () => {
  let service: CoachRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoachRequest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
