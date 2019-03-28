import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CRA } from '../Model/cra.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class CraService {
    allCra: CRA[];
    
    craSubject = new Subject<CRA[]>();

    constructor(){ 
      this.allCra = [];
      this.getAllCRA();
    }

    emitCra() {
      /* recupere l'object allCra et l'emet a travers le subject craSubjet */
      this.craSubject.next(this.allCra);
    }

    saveCRA() {
      firebase.database().ref('/cra').set(this.allCra);
    }

    getAllCRA() {
      firebase.database().ref('/cra')
      .on('value', data => {
        this.allCra = data.val() ? data.val() : [];
        this.emitCra();
        //console.log('Données CRA bien recupérées en Base');
    });
    }

    getSingleCRA(id: number) {
      return new Promise(
        // tslint:disable-next-line:no-shadowed-variable
        (resolve, reject ) => {
          firebase.database().ref('/cra' + id).once('value').then(
            data => {
              resolve(data.val());
            }, error => {8
              reject(error);
            }
          );
        }
      );
    }

    createNewCRA(cra: CRA) {
      //console.log(cra);
      //console.log(this.allCra);
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
      return new Promise(
        (resolve, reject) =>{
          const upload = firebase.storage().ref();
          let uploadFile=upload.child('CRA-PDF/'+ Date.now() + fileName).put(docPdf);

          uploadFile.on(firebase.storage.TaskEvent.STATE_CHANGED,
            ()=>{
              console.log('Sauvergarde de version PDF en cours....');
            },
            (error)=>{
              console.log('Erreur du chargement de la version PDF!' + error);
              reject();
            },
            ()=>{
              console.log('Sauvergarde de la version PDF terminé :)' + uploadFile.snapshot.ref.getDownloadURL());
              resolve(uploadFile.snapshot.ref.getDownloadURL());
            }

          );
        }
      );
    }

    uploadCsvFile(csvfile: Blob, fileName:string){
      return new Promise(
        (resolve, reject) =>{
          const upload = firebase.storage().ref();
          let uploadFile = upload.child('CsvFiles/'+ Date.now() +'_'+ fileName).put(csvfile);

          uploadFile.on(firebase.storage.TaskEvent.STATE_CHANGED,
            ()=>{
              console.log('Sauvergarde de version CSV en cours....');
            },
            (error)=>{
              console.log('Erreur du chargement de la version CSV!' + error);
              reject();
            },
            ()=>{
                console.log('Sauvergarde de la version CSV terminé :)' + uploadFile.snapshot.ref.getDownloadURL());
                resolve(uploadFile.snapshot.ref.getDownloadURL());
            }
          );
        }
      );
    }


    /**
     * NOT USED 
     *     downloadFile(data: any) {
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');
  
      var a = document.createElement('a');
      var blob = new Blob([csvArray], {type: 'text/csv' }),
      url = window.URL.createObjectURL(blob);
  
      a.href = url;
      a.download = "myFile.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
     * 
     */
}
