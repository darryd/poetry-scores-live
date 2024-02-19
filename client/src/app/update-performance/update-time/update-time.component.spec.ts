import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTimeComponent } from './update-time.component';

describe('UpdateTimeComponent', () => {
  let component: UpdateTimeComponent;
  let fixture: ComponentFixture<UpdateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
