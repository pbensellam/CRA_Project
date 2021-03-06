import { Component } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CRA-App';
  constructor() {
      // tslint:disable-next-line:prefer-const
      let configXLM = {
        apiKey: "AIzaSyBPPDEYHmuBFGsImdtu0RRxL4i-K9aSIts",
        authDomain: "cra-application.firebaseapp.com",
        databaseURL: "https://cra-application.firebaseio.com",
        projectId: "cra-application",
        storageBucket: "cra-application.appspot.com",
        messagingSenderId: "437002166801"
      }
      let configPierre = {
        apiKey: 'AIzaSyBbVCAPU5s-I9K4m--P1RO2I6KrAlXIa1M',
        authDomain: 'cra-app-xlm.firebaseapp.com',
        databaseURL: 'https://cra-app-xlm.firebaseio.com',
        projectId: 'cra-app-xlm',
        storageBucket: 'cra-app-xlm.appspot.com',
        messagingSenderId: '565896986150'
      };
  firebase.initializeApp(configXLM);
  }
}
