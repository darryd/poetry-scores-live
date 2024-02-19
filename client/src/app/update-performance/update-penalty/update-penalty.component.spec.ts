import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePenaltyComponent } from './update-penalty.component';

describe('UpdatePenaltyComponent', () => {
  let component: UpdatePenaltyComponent;
  let fixture: ComponentFixture<UpdatePenaltyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePenaltyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePenaltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
