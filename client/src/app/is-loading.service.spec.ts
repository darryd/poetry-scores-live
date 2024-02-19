import { TestBed } from '@angular/core/testing';

import { IsLoadingService } from './is-loading.service';

describe('IsLoadingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IsLoadingService = TestBed.get(IsLoadingService);
    expect(service).toBeTruthy();
  });
});
