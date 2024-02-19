import { TestBed } from '@angular/core/testing';

import { IsAuthenticatedService } from './is-authenticated.service';

describe('IsAuthenticatedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IsAuthenticatedService = TestBed.get(IsAuthenticatedService);
    expect(service).toBeTruthy();
  });
});
