import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePerformanceComponent } from './update-performance.component';

describe('UpdatePerformanceComponent', () => {
  let component: UpdatePerformanceComponent;
  let fixture: ComponentFixture<UpdatePerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
