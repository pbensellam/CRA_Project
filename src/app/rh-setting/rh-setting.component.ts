import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RHSettingService } from '../Service/rhSetting.service';
import { RhSetting } from '../Model/rhSetting.model';
import { Subscription } from 'rxjs';
import { mapChildrenIntoArray } from '@angular/router/src/url_tree';

@Component({
  selector: 'app-rh-setting',
  templateUrl: './rh-setting.component.html',
  styleUrls: ['./rh-setting.component.scss']
})

export class RhSettingComponent implements OnInit {

  rhSettings: RhSetting;
  rhSettingFrom: FormGroup;
  rhSettingSubcribtion:Subscription;

  constructor(
    private formBuilder:FormBuilder,
    private router:Router,
    private rhService: RHSettingService
    ) { }
  
  @ViewChild('content') Content: ElementRef;

  ngOnInit() {
    
    this.rhSettingFrom=this.formBuilder.group(
      {
        emailRH:['', [Validators.email,Validators.required]],
        currentMonth:['', [Validators.required]],
        nbBusinessDayJan:'',
        nbBusinessDayFeb:'',
        nbBusinessDayMar:'',
        nbBusinessDayApr:'',
        nbBusinessDayMay:'',
        nbBusinessDayJun:'',
        nbBusinessDayJul:'',
        nbBusinessDayAug:'',
        nbBusinessDaySep:'',
        nbBusinessDayOct:'',
        nbBusinessDayNov:'',
        nbBusinessDayDec:'',
      }
    );
    this.initForm();
  }

  initForm(){

    this.rhService.getRHSettingsFromServer();
    
    this.rhSettingSubcribtion=this.rhService.rhSettingSubject.subscribe(
      (rhSettings: RhSetting)=> {
        this.rhSettings = rhSettings;
        console.log(this.rhSettings.emailRH);
        this.rhSettingFrom=this.formBuilder.group(
          {
            emailRH:[this.rhSettings.emailRH, [Validators.email,Validators.required]],
            currentMonth:[this.rhSettings.currentMonth, [Validators.required]],
            nbBusinessDayJan:this.rhSettings.nbBusinessDayJan,
            nbBusinessDayFeb:this.rhSettings.nbBusinessDayFeb,
            nbBusinessDayMar:this.rhSettings.nbBusinessDayMar,
            nbBusinessDayApr:this.rhSettings.nbBusinessDayApr,
            nbBusinessDayMay:this.rhSettings.nbBusinessDayMay,
            nbBusinessDayJun:this.rhSettings.nbBusinessDayJun,
            nbBusinessDayJul:this.rhSettings.nbBusinessDayJul,
            nbBusinessDayAug:this.rhSettings.nbBusinessDayAug,
            nbBusinessDaySep:this.rhSettings.nbBusinessDaySep,
            nbBusinessDayOct:this.rhSettings.nbBusinessDayOct,
            nbBusinessDayNov:this.rhSettings.nbBusinessDayNov,
            nbBusinessDayDec:this.rhSettings.nbBusinessDayDec,
          }
        );
      }
    );

    //this.rhService.emitRhSettings();
    /*
    
    */
  }

  onSubmit(){
    const plan = new Map();
    
    const formValue = this.rhSettingFrom.value;
    const newRhSetting= new RhSetting(
      formValue['currentMonth'],
      formValue['emailRH'],
      formValue['nbBusinessDayJan'],
      formValue['nbBusinessDayFeb'],
      formValue['nbBusinessDayMar'],
      formValue['nbBusinessDayApr'],
      formValue['nbBusinessDayMay'],
      formValue['nbBusinessDayJun'],
      formValue['nbBusinessDayJul'],
      formValue['nbBusinessDayAug'],
      formValue['nbBusinessDaySep'],
      formValue['nbBusinessDayOct'],
      formValue['nbBusinessDayNov'],
      formValue['nbBusinessDayDec'],

    );
    this.rhService.saveRHSettingToServer(newRhSetting);
  }

}

