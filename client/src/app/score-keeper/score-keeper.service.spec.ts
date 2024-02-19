import { TestBed } from '@angular/core/testing';

import { ScoreKeeperService } from './score-keeper.service';

describe('ScoreKeeperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScoreKeeperService = TestBed.get(ScoreKeeperService);
    expect(service).toBeTruthy();
  });
});
