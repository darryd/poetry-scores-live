import { TestBed } from '@angular/core/testing';

import { PreviousRoundsService } from './previous-rounds.service';

describe('PreviousRoundsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviousRoundsService = TestBed.get(PreviousRoundsService);
    expect(service).toBeTruthy();
  });
});
