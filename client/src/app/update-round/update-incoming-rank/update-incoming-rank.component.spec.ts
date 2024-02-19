import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIncomingRankComponent } from './update-incoming-rank.component';

describe('UpdateIncomingRankComponent', () => {
  let component: UpdateIncomingRankComponent;
  let fixture: ComponentFixture<UpdateIncomingRankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateIncomingRankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateIncomingRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
