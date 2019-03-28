import { Injectable } from "@angular/core";
import { RhSetting } from '../Model/rhSetting.model';
import { Subject } from 'rxjs';
import * as firebase from 'firebase';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class RHSettingService{

    private rhSetting: RhSetting;
    rhSettingSubject = new Subject<RhSetting>();

    constructor(
        private httpClient: HttpClient
        ){ 
    }

    emitRhSettings() {
      /* recupere l'object allCra et l'emet a travers le subject craSubjet */
      this.rhSettingSubject.next(this.rhSetting);
    }


    saveRHSettingToServer(newRhSetting: RhSetting) {
        this.rhSetting = newRhSetting;
        console.log(this.rhSetting.emailRH);
        console.log(this.rhSetting.currentMonth);
        this.httpClient
            .put('https://cra-application.firebaseio.com/rhSettings.json', this.rhSetting)
            .subscribe(
                ()=>{
                    console.log('Paramètres RH sauvergardé !');
                },
                (error)=>{
                    console.log('Erreur de sauvegarde des paramètres RH ! '+ error);
                }
            );
            this.emitRhSettings();
        //firebase.database().ref('/rhSettings').set(this.allRhSettings);
    }

    getRHSettingsFromServer() {
        this.httpClient
          .get<RhSetting>('https://cra-application.firebaseio.com/rhSettings.json')
          .subscribe(
            (response) => {
              this.rhSetting = response;
              console.log('Paramètres RH ont bien été récupérés depuis le serveur !');
              this.emitRhSettings();
            },
            (error) => {
              console.log('Erreur lors de la récupération des données des paramètre RH ! : ' + error);
            }
          );
    }
}