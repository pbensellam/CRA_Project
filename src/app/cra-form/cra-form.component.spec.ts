import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRAFormComponent } from './cra-form.component';

describe('CRAFormComponent', () => {
  let component: CRAFormComponent;
  let fixture: ComponentFixture<CRAFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRAFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRAFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
