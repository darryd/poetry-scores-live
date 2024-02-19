import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRowsComponent } from './edit-rows.component';

describe('EditRowsComponent', () => {
  let component: EditRowsComponent;
  let fixture: ComponentFixture<EditRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
