import { TestBed } from '@angular/core/testing';

import { NumberOfViewersService } from './number-of-viewers.service';

describe('NumberOfViewersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NumberOfViewersService = TestBed.get(NumberOfViewersService);
    expect(service).toBeTruthy();
  });
});
