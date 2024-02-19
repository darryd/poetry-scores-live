import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTimeLimitComponent } from './update-time-limit.component';

describe('UpdateTimeLimitComponent', () => {
  let component: UpdateTimeLimitComponent;
  let fixture: ComponentFixture<UpdateTimeLimitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateTimeLimitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTimeLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
