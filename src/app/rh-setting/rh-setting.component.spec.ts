import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RhSettingComponent } from './rh-setting.component';

describe('RhSettingComponent', () => {
  let component: RhSettingComponent;
  let fixture: ComponentFixture<RhSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RhSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RhSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
