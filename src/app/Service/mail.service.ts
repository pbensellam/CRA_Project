import { Subject } from 'rxjs';
import * as firebase from 'firebase';
import { Mail } from '../Model/mail.model';
import { Injectable } from '@angular/core';

@Injectable({ 
    providedIn: 'root'
})

export class MailService {
    
    private mails : Mail[]= [];
    mailSubject = new Subject<Mail[]>();
    constructor(){

    }
    emitMail(){
        this.mailSubject.next(this.mails.slice());
    }
    resetMails(){
        this.mails = [];
        this.emitMail;
    }
    addMail(mail:Mail){
        
        return new Promise(
            (resolve, reject ) =>{
                firebase.database().ref('/mail').set(mail).then(
                    data => {
                        resolve(data.val());
                    }, error=>{
                        reject(error);
                    }  
                );
        });
    }

}