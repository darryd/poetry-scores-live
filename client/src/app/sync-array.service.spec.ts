import { TestBed } from '@angular/core/testing';

import { SyncArrayService } from './sync-array.service';

describe('SyncArrayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SyncArrayService = TestBed.get(SyncArrayService);
    expect(service).toBeTruthy();
  });
});
