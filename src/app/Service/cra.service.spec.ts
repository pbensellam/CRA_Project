import { TestBed, ComponentFixture } from '@angular/core/testing';

import { CraService } from './cra.service';
import { CRAFormComponent } from '../cra-form/cra-form.component';
import { DebugElement } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { config, of } from 'rxjs';
import { async } from 'q';

describe('CraService', () => {
  let component : CRAFormComponent;
  let fixture: ComponentFixture<CRAFormComponent>;
  let de : DebugElement;
  let service : CraService;
  let spy: jasmine.Spy;

  beforeEach(async(() => { TestBed.configureTestingModule({
    imports: [
      AngularFireModule.initializeApp(config),
      AngularFireDatabaseModule
    ],
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

  it('should be created', () => {
    const service: CraService = TestBed.get(CraService);
    expect(service).toBeTruthy();
  });

  it('should call CreateNewCRA', () => {
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.all().length).toEqual(1);
  });
  
});
