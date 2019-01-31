import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CRA } from '../Model/cra.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class CraService {
    private allCra: CRA[] = [];
    craSubject = new Subject<CRA[]>();

    constructor() { }

    emitCra() {
      /* recupere l'object allCra et l'emet a travers le subject craSubjet */
      this.craSubject.next(this.allCra.slice());
    }

    saveCRA() {
      firebase.database().ref('/cra').set(this.allCra);
     /*  ('/cra').set(this.allCra);
      this.httpClient
        .post('https://cra-app-xlm.firebaseio.com/cra.json', this.allCra)
        .subscribe(
          () => {
            console.log('Saving with success :)');
          },
          (error) => {
              console.log('Error while Saving CRAs :(' +  error);
          }
        ); */
    }

    getAllCRA() {
      firebase.database().ref('/cra')
      .on('value', data => {
        this.allCra = data.val() ? data.val() : [];
        this.emitCra();
    });
    }

    getSingleCRA(id: number) {
      return new Promise(
        // tslint:disable-next-line:no-shadowed-variable
        (resolve, reject ) => {
          firebase.database().ref('/cra' + id).once('value').then(
            data => {
              resolve(data.val());
            }, error => {
              reject(error);
            }
          );
        }
      );
    }

    createNewCRA(cra: CRA) {
      this.allCra.push(cra);
      // console.log('nouveau cra creee pour ' + cra.name);
      // console.log('Liste des CRA dans l array local:');
      // this.allCra.forEach(element => {
      //    console.log('CRA de :' + element.name);
      // });

      this.saveCRA();
      this.emitCra();
    }

    deleteCRA(cra: CRA) {
      const indexCra = this.allCra.findIndex(
        (craEl) => {
          if (craEl === cra) {
            return true;
          }
        }
      );
      this.allCra.splice(indexCra, 1);
      this.saveCRA();
      this.emitCra();
    }
}
