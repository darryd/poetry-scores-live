import { TestBed } from '@angular/core/testing';

import { WatchParentsService } from './watch-parents.service';

describe('WatchParentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WatchParentsService = TestBed.get(WatchParentsService);
    expect(service).toBeTruthy();
  });
});
