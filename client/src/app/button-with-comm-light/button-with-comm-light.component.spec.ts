import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonWithCommLightComponent } from './button-with-comm-light.component';

describe('ButtonWithCommLightComponent', () => {
  let component: ButtonWithCommLightComponent;
  let fixture: ComponentFixture<ButtonWithCommLightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonWithCommLightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonWithCommLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
