import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationLightsComponent } from './communication-lights.component';

describe('CommunicationLightsComponent', () => {
  let component: CommunicationLightsComponent;
  let fixture: ComponentFixture<CommunicationLightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunicationLightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationLightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
