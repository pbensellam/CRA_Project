import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRAFormComponent } from './cra-form.component';
import { DebugElement } from '@angular/core';
//import { AngularFireDatabaseModule } from 'angularfire2/database';
import { CraService } from '../Service/cra.service';
//import { AngularFireModule } from 'angularfire2';
import { config, of } from 'rxjs';
import { By } from 'protractor';
import * as firebase from 'firebase';

describe('CRAFormComponent', () => {
  let component : CRAFormComponent;
  let fixture: ComponentFixture<CRAFormComponent>;
  let de : DebugElement;
  let service : CraService;
  let spy: jasmine.Spy;

  beforeEach(async(() => { TestBed.configureTestingModule({
    imports: [firebase],
    declarations: [CRAFormComponent],
    providers:[CraService]
  }).compileComponents();
  }));
  
  beforeEach(() => {
    fixture=TestBed.createComponent(CRAFormComponent);
    component = fixture.componentInstance;
    service = de.injector.get(CraService);
    spy= spyOn(service, 'createNewCRA').and.returnValue(of('You have been warned'));
    fixture.detectChanges();
  });
  /*
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
    de = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call CreateNewCRA', () => {
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.all().length).toEqual(1);
    expect(de.query(By.scss('.message-body')).nativeElement.innerText)
      .toContain('warn');
  });

  it('should create a pdf file and save data in firebase database', () => {
    expect(component.onSubmitForm).toBeTruthy();
  });
  */
});
