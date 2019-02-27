import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class CraService {
    private allCra: CRA[] = [];
    craSubject = new Subject<CRA[]>();

    constructor(){ 
      this.getAllCRA();
    }

    emitCra() {
      /* recupere l'object allCra et l'emet a travers le subject craSubjet */
      this.craSubject.next(this.allCra);
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

    uploadPdfFile(docPdf: Blob, fileName: string){
      /*
      const upload = firebase.storage().ref()
        .child('CRA-PDF/' + Date.now() + 'CRA-PDF.pdf')
        .put(docPdf);

      console.log(upload.snapshot.downloadURL);
      return upload.snapshot.downloadURL;
    }*/
      return new Promise(
        (resolve, reject) =>{
          const date = Date.now().toString();
          const upload = firebase.storage().ref()
            .child('CRA-PDF/'+ Date.now() + fileName)
            .put(docPdf);
          upload.snapshot.downloadURL
          upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
            ()=>{
              console.log('Chargement en cours....');
            },
            (error)=>{
              console.log('Erreur du chargement!' + error);
              reject();
            },
            ()=>{
                console.log('Chargement terminé :)' + upload.snapshot.ref.getDownloadURL());
          resolve(upload.snapshot.ref.getDownloadURL());
            }
          );
        }
      );
    }

    uploadFile(file: File){
      return new Promise(
        (resolve, reject) =>{
          const date = Date.now().toString();
          const upload = firebase.storage().ref()
            .child('files/'+ date + file.name)
            .put(file);
          upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
            ()=>{
              console.log('Chargement en cours....');
            },
            (error)=>{
              console.log('Erreur du chargement!' + error);
              reject();
            },
            ()=>{
                resolve(upload.snapshot.downloadURL);
            }
          );
        }
      );
    }
}
