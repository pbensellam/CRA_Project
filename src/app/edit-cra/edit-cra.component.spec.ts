import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCRAComponent } from './edit-cra.component';

describe('EditCRAComponent', () => {
  let component: EditCRAComponent;
  let fixture: ComponentFixture<EditCRAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCRAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCRAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
