import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CraService } from '../Service/cra.service';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'util';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cra-form',
  templateUrl: './cra-form.component.html',
  styleUrls: ['./cra-form.component.scss']
})

export class CRAFormComponent implements OnInit {
  craForm: FormGroup;
  cra: CRA;
  fileIsUploading = false;
  fileUrl: string;
  fileUpdloaded = false;

  constructor(private formBuilder: FormBuilder,
              private craService: CraService,
              private router: Router,
              ) { }
  // tslint:disable-next-line:no-trailing-whitespace

  @ViewChild('content') Content: ElementRef;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.craForm = this.formBuilder.group({
        month : ['', Validators.required],
        name: ['', Validators.required],
        responsibleName: ['', Validators.required],
        responsibleEmail : ['', [Validators.email, Validators.required]],
        company : ['', Validators.required],
        email : ['', [Validators.email, Validators.required]],
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

  dowloadFormToPDFasText() {

    const pipe = new DatePipe('en-US');
    const now = Date.now();
    const myFormattedDate = pipe.transform(now, 'longDate');

    const formValue = this.craForm.value;

    const title = 'CRA ' + formValue['month'] + ' ' + formValue['name'];
    const responsibleName = 'Responsable client: ' + formValue['responsibleName'] + ' Email: ' + formValue['responsibleEmail'];
    const details = 'Détail Mission: \n ' + formValue['details'];
    const annualLeave = 'Congés Annuels: ' + formValue['nbAnnualLeave']
                          + ' du ' + formValue['dateBeginAnnualLeave'] + ' au ' + formValue['dateEndAnnualLeave'];
    const sicknessLeave = 'Congés Maladie: ' + formValue['nbSicknessLeave']
                          + ' du ' + formValue['dateBeginSicknessLeave'] + ' au ' + formValue['dateEndSicknessLeave'];
    const rtt = 'RTT: ' + formValue['nbRTT']
                          + ' du ' + formValue['dateBeginRTT'] + ' au ' + formValue['dateEndRTT'];

    const css = 'Congés sans solde: ' + formValue['nbUnpaidLeave']
                          + ' du ' + formValue['dateBeginUnpaidLeave'] + ' au ' + formValue['dateEndUnpaidLeave'];
    const craComment = formValue['craComment'];

    const nbWorkDay = 'Nombre de jour travaillé : ' + formValue['nbWorkDay'];
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
    docPDF.text(responsibleName, 20, 40);
    docPDF.text(annualLeave, 20, 50);
    docPDF.text(sicknessLeave, 20, 60);
    docPDF.text(rtt, 20, 70);
    docPDF.text(css, 20, 80);

    docPDF.text(overtimeW1, 20, 100);
    docPDF.text(overtimeW2, 20, 110);
    docPDF.text(overtimeW3, 20, 120);
    docPDF.text(overtimeW4, 20, 130);
    docPDF.text(overtimeW5, 20, 140);
    docPDF.setFontType('bold');
    docPDF.text(nbWorkDay,20,150);
    docPDF.setFontType('regular');
    let i = 0;
    docPDF.setFontSize(10);
    docPDF.text('Commentaires: \n',20,175);
    docPDF.setFontType('regular');
    let arrayComment = docPDF.splitTextToSize(craComment,180);
    arrayComment.forEach(element => {
      docPDF.text(element,20,95+i);
      i=i+5;
    });
    docPDF.text(myFormattedDate, 10, 277);
    docPDF.text(signature, 100, 277);

  // Page dédiée au détail de la mission:
    docPDF.addPage();
    //docPDF.text(newDetails, 10, 20);
    i=0;
    let arr = docPDF.splitTextToSize(details,180);
    arr.forEach(element => {
      docPDF.text(element,20,20+i);
      i=i+5;
    });
    docPDF.text(myFormattedDate, 10, 277);
    docPDF.text(signature, 100, 277);
    const docName='cra_'+ formValue['name'] +'_'+  myFormattedDate + '.pdf';
    docPDF.save(docName);
    
    const pdf = docPDF.output('blob');
    //const data = new FormData();
    //data.append('data' , pdf);
    //this.fileUrl = this.craService.uploadPdfFile(pdf);
    this.onUploadPdfFile(pdf,docName);
  }

  onUploadPdfFile(pdf: Blob, fileName: string){
    this.craService.uploadPdfFile(pdf, fileName).then(
      (url:string)=>{
        this.fileUpdloaded = true;
        this.fileUrl = url;
        console.log(url);
        this.onSubmitForm();
      }
    );
  }

  onSubmitForm() {
    
    const formValue = this.craForm.value;
    const newCra = new CRA(
        formValue['month'],
        formValue['name'],
        formValue['responsibleName'],
        formValue['responsibleEmail'],
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
    //this.dowloadFormToPDFasText();
    if(this.fileUrl && this.fileUrl !== '') {
      newCra.pdfFile = this.fileUrl;
    }
    this.craService.createNewCRA(newCra);
    this.router.navigate(['']);
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
  onUploadFile(file:File) : string {
    this.fileIsUploading= true;
    this.craService.uploadFile(file).then(
      (url:string) => {
        //this.fileIsUploading=false;
        this.fileUpdloaded = true;
        return url;
      }
    );
    return '';
  }
}
