import { TestBed } from '@angular/core/testing';

import { PoetsService } from './poets.service';

describe('PoetsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoetsService = TestBed.get(PoetsService);
    expect(service).toBeTruthy();
  });
});
