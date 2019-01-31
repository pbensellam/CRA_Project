import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CraService } from '../Service/cra.service';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ValidatePositiveNumber } from '../MyValidators/positiveNumber.validator';

@Component({
  selector: 'app-cra-form',
  templateUrl: './cra-form.component.html',
  styleUrls: ['./cra-form.component.scss']
})

export class CRAFormComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private craService: CraService,
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
        nbWorkDay : [0],
        craComment : ''
    });
  }
  downloadFormToPDFasHTML(){
    // Doesn't work !
    const formValue = this.craForm.value;
    const input = document.getElementById('craForm');
    const docPDF = new jsPDF('p','mm','a4');
    docPDF.addHTML(input,function(){
      docPDF.save('FileWithaddHTML.pdf');
    });
   /*  html2canvas(input).then(
      (canvas) => {
        const docPDF = new jsPDF('p', 'mm', 'a4');
        docPDF.addHTML(input.)
      }).catch((err) => {
        console.log(err); 
      }); */
      
  }

  dowloadFormToPDFasText() {
    const formValue = this.craForm.value;

    const title = 'CRA ' + formValue['month'] + ' ' + formValue['name'];
    const responsibleName = 'Responsable client: ' + formValue['responsibleName'];
    // const details = 'Détail Mission: ' + formValue['details'];
    const annualLeave = 'Congés Annuels: ' + formValue['nbAnnualLeave']
                          + ' du ' + formValue['dateBeginAnnualLeave'] + ' au ' + formValue['dateEndAnnualLeave'];
    const sicknessLeave = 'Congés Maladie: ' + formValue['nbSicknessLeave']
                          + ' du ' + formValue['dateBeginSicknessLeave'] + ' au ' + formValue['dateEndSicknessLeave'];
    const rtt = 'RTT: ' + formValue['nbRTT']
                          + ' du ' + formValue['dateBeginRTT'] + ' au ' + formValue['dateEndRTT'];

    const css = 'Congés sans solde: ' + formValue['nbUnpaidLeave']
                          + ' du ' + formValue['dateBeginUnpaidLeave'] + ' au ' + formValue['dateEndUnpaidLeave'];
    const craComment = 'Commentaires ' + formValue['craComment'];
    const nbWorkDay = 'Nombre de jour travaillé ' + formValue['nbWorkDay'];
    const overtimeW1 = 'Heures supplémentaire S1: ' + formValue['overtimeW1'];
    const overtimeW2 = 'Heures supplémentaire S2: ' + formValue['overtimeW2'];
    const overtimeW3 = 'Heures supplémentaire S3: ' + formValue['overtimeW3'];
    const overtimeW4 = 'Heures supplémentaire S4: ' + formValue['overtimeW4'];
    const overtimeW5 = 'Heures supplémentaire S5: ' + formValue['overtimeW5'];
    const docPDF = new jsPDF('p', 'mm', 'a4');
    docPDF.text(title, 50, 20, '');
    docPDF.text(responsibleName, 20, 30);
    docPDF.text('Détail Mission:',20,40);
    docPDF.setFontSize(9);
    docPDF.text(formValue['details'],20,45);
    let details = formValue['details'];
    if (details.length > 170){
      
    }
    console.log ('nombre de ligne dans détail: ' + 
        (formValue['details'].split(/\r\n|\r|\n/).length));
    docPDF.text(formValue['details'],20,45);
    
    /* console.log ('nombre de ligne dans détail: ' + 
        (formValue['details'].match(/\r?\n/g) || '').length + 1); */
   // docPDF.table(15, 100, [overtimeW1,overtimeW2, overtimeW3], ['Heures supplémentaires'], );
    docPDF.save('PDF_file.pdf');
  }
  downloadFormToPDFasImage() {
    const input = document.getElementById('craForm');

    html2canvas(input).then(
      (canvas) => {
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
// creer le document pdf
          const doc = new jsPDF('p', 'mm');
// Cast le contenur HTML du la div craFrom en image
          const imgData = canvas.toDataURL('image/png');
// ajoute l'image au document pdf
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
// Pour gerer le depassement de page:
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          doc.save( 'file.pdf');
    }).catch((err) => {
      console.log('erreur avec html2canvas ' + err);
    });

  }

  onSubmitForm() {
    /* const formValue = this.craForm.value;
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
    this.craService.createNewCRA(newCra); */
    this.dowloadFormToPDFasText();
  }
}
