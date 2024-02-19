import { TestBed } from '@angular/core/testing';

import { MyTurnService } from './my-turn.service';

describe('MyTurnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyTurnService = TestBed.get(MyTurnService);
    expect(service).toBeTruthy();
  });
});
