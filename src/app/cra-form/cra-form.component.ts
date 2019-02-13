import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CraService } from '../Service/cra.service';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {  MailService } from '../Service/mail.service';

@Component({
  selector: 'app-cra-form',
  templateUrl: './cra-form.component.html',
  styleUrls: ['./cra-form.component.scss']
})

export class CRAFormComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private craService: CraService,
              private mailService: MailService,
              private router: Router) { }
  // tslint:disable-next-line:no-trailing-whitespace

  craForm: FormGroup;
  cra: CRA;

  @ViewChild('content') Content: ElementRef;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.craForm = this.formBuilder.group({
        month : ['', Validators.required],
        name: ['Nom Consultant', Validators.required],
        responsibleName: ['Nom du Responsable', Validators.required],
        company : ['', Validators.required],
        email : ['', Validators.email],
        details : '',
        nbAnnualLeave : 0 ,
        nbUnpaidLeave : 0,
        nbSicknessLeave : 0,
        nbRTT : 0,
        dateEndAnnualLeave : '',
        dateBeginAnnualLeave : '',
        dateBeginSicknessLeave : '',
        dateEndSicknessLeave : '',
        dateBeginUnpaidLeave : '',
        dateEndUnpaidLeave : '',
        dateBeginRTT : '',
        dateEndRTT : '',
        overtimeW1 : '',
        overtimeW2 : '',
        overtimeW3 : '',
        overtimeW4 : '',
        overtimeW5 : '',
        nbWorkDay : [0,Validators.required],
        craComment : ''
    });
  }

  downloadFormToPDFasHTML(){
    const formValue = this.craForm.value;
    const input = document.getElementById('div-details');
    const docPDF = new jsPDF('p','mm','a4');
     /* docPDF.addHTML(input,function(){
      //docPDF.save('FileWithaddHTML.pdf');
    }) */
    docPDF.fromHTML(document.getElementById('div-responsible'),20,10);
    docPDF.setFontSize(10);
    docPDF.fromHTML(document.getElementById('annual-leave'),20,20);
    //docPDF.fromHTML(document.getElementById('div-details'),20,150);
    docPDF.fromHTML(document.getElementById('div-details'),20,50);
    this.downloadFormToPDFasImage(docPDF, 65, 'details');
    docPDF.save('file.pdf');
  }

  dowloadFormToPDFasText() {
    const formValue = this.craForm.value;

    const title = 'CRA ' + formValue['month'] + ' ' + formValue['name'];
    const responsibleName = 'Responsable client: ' + formValue['responsibleName'];
    const details = 'Détail Mission: \n ' + formValue['details'];
    const annualLeave = 'Congés Annuels: ' + formValue['nbAnnualLeave']
                          + ' du ' + formValue['dateBeginAnnualLeave'] + ' au ' + formValue['dateEndAnnualLeave'];
    const sicknessLeave = 'Congés Maladie: ' + formValue['nbSicknessLeave']
                          + ' du ' + formValue['dateBeginSicknessLeave'] + ' au ' + formValue['dateEndSicknessLeave'];
    const rtt = 'RTT: ' + formValue['nbRTT']
                          + ' du ' + formValue['dateBeginRTT'] + ' au ' + formValue['dateEndRTT'];

    const css = 'Congés sans solde: ' + formValue['nbUnpaidLeave']
                          + ' du ' + formValue['dateBeginUnpaidLeave'] + ' au ' + formValue['dateEndUnpaidLeave'];
    let craComment = 'Commentaires: \n' + formValue['craComment'];
    /*
    let arrayComment = craComment.split('\n');
    let newCraComment = '';

    let newDetails ='';
    let arrayDetails = details.split('\n');
    arrayDetails.forEach(element => {
      if (element.length > 90) {
        element = this.addReturnInStringEachNCaracters(element, 90);
      }
      newDetails = newDetails + '\n' + element;
    });
    

    arrayComment.forEach(element => {
      if (element.length > 90){
        console.log('element de plus de 90 caractères:' + element);
        element = this.addReturnInStringEachNCaracters(element, 90);
      }
      newCraComment = newCraComment + '\n' + element; 
    });
*/
    //console.log('nouveau Commentaire' + newCraComment);
    const nbWorkDay = 'Nombre de jour travaillé ' + formValue['nbWorkDay'];
    const overtimeW1 = 'Heures supplémentaire S1: ' + formValue['overtimeW1'];
    const overtimeW2 = 'Heures supplémentaire S2: ' + formValue['overtimeW2'];
    const overtimeW3 = 'Heures supplémentaire S3: ' + formValue['overtimeW3'];
    const overtimeW4 = 'Heures supplémentaire S4: ' + formValue['overtimeW4'];
    const overtimeW5 = 'Heures supplémentaire S5: ' + formValue['overtimeW5'];
    const signature = 'Signature: ' + formValue['name'];
    const docPDF = new jsPDF('p', 'mm', 'a4');
    docPDF.setFontSize(18);
    docPDF.text(title, 50, 20, '');
    docPDF.setFontSize(10);
    docPDF.text(responsibleName, 20, 30);
    docPDF.text(annualLeave, 20, 40);
    docPDF.text(sicknessLeave, 20, 45);
    docPDF.text(rtt, 20, 50);
    docPDF.text(css, 20, 55);
    docPDF.text(overtimeW1, 20, 60);
    docPDF.text(overtimeW2, 20, 65);
    docPDF.text(overtimeW3, 20, 70);
    docPDF.text(overtimeW4, 20, 75);
    docPDF.text(overtimeW5, 20, 80);
    docPDF.setFontType('bold');
    docPDF.text(nbWorkDay,20,90);
    docPDF.setFontType('regular');
    let i = 0;
    let arrayComment = docPDF.splitTextToSize(craComment,150);
    arrayComment.forEach(element => {
      docPDF.text(element,10,20+i);
      i=i+5;
    });
    docPDF.text(arrayComment, 10, 100);
    docPDF.text(Date(), 10, 250);
    docPDF.text(signature, 100, 250);

  // Page dédiée au détail de la mission:
    docPDF.addPage();
    //docPDF.text(newDetails, 10, 20);
    docPDF.text(Date(), 10, 250);

    i=0;
    let arr = docPDF.splitTextToSize(details,150);
    arr.forEach(element => {
      docPDF.text(element,10,20+i);
      i=i+5;
    });

    docPDF.text(signature, 100, 250);
    docPDF.save('cra'+Date()+'.pdf');
    
/*
    //this.downloadFormToPDFasImage(docPDF, 130, 'details');
    //docPDF.fromHTML(document.getElementById('div-leaves'),20,80);
    
    console.log ('nombre de ligne dans détail: ' + 
        (formValue['details'].split(/\r\n|\r|\n/).length));
    console.log ('nombre de ligne dans détail v2: ' + 
        (formValue['details'].match(/\r?\n/g) || '').length + 1);
   // docPDF.table(15, 100, [overtimeW1,overtimeW2, overtimeW3], ['Heures supplémentaires'], );
    //docPDF.save('PDF_file.pdf');
*/
  }
  
  addReturnInStringEachNCaracters(str: string, n:number): string{
    // NOT USE REPLACE by JSPDF.splitTextToSize
    let i=0;
    let strTemp ='';
    for (let index = 0; index <= str.length; index++) {
      //const element = craComment[index];
      if (index % n === 0 && index > 0){ // 50 lettres max sur une ligne 
        for (let index2 = i; index2 <= index; index2++) {
          strTemp = strTemp + str[index2];
        }
        strTemp = strTemp + '\n';
        i= index + 1;
      } 
    }
    //Ajoute la fin de la chaine de caractère:
    if (i < str.length){
      for (let index = i; index <= str.length; index++) {
        strTemp = strTemp + str[index];
      }
    }
    return strTemp;
  }

  onSubmitForm() {
    const formValue = this.craForm.value;
    const newCra = new CRA(
        formValue['month'],
        formValue['name'],
        formValue['responsibleName'],
        formValue['email'],
        formValue['details'],
        formValue['nbAnnualLeave'],
        formValue['nbUnpaidLeave'],
        formValue['nbSicknessLeave'],
        formValue['nbRTT'],
        formValue['dateEndAnnualLeave'],
        formValue['dateBeginAnnualLeave'],
        formValue['dateBeginSicknessLeave'],
        formValue['dateEndSicknessLeave'],
        formValue['dateBeginUnpaidLeave'],
        formValue['dateEndUnpaidLeave'],
        formValue['dateBeginRTT'],
        formValue['dateEndRTT'],
        formValue['overtimeW1'],
        formValue['overtimeW2'],
        formValue['overtimeW3'],
        formValue['overtimeW4'],
        formValue['overtimeW5'],
        formValue['craComment'],
        formValue['nbWorkDay']
    );
    this.craService.createNewCRA(newCra);    
    this.dowloadFormToPDFasText();
  }

  downloadFormToPDFasImage(docPDF: jsPDF, position: number, elementId: string) {
    const input = document.getElementById(elementId);

    html2canvas(input).then(
      (canvas) => {
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
// creer le document pdf
          // const docPDF = new jsPDF('p', 'mm');
// Cast le contenur HTML du la div craFrom en image
          const imgData = canvas.toDataURL('image/png');
// ajoute l'image au document pdf
          docPDF.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
// Pour gerer le depassement de page:
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            docPDF.addPage();
            docPDF.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          //doc.save( 'file.pdf');
    }).catch((err) => {
      console.log('erreur avec html2canvas ' + err);
    });

  }

}
