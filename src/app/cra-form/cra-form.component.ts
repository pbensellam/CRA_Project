import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CraService } from '../Service/cra.service';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DatePipe } from '@angular/common';
import { Input } from '@angular/core';
import {  Overtime } from '../Model/overtime.model';
import { RHSettingService } from '../Service/rhSetting.service';
import { Subscription } from 'rxjs';
import { RhSetting } from '../Model/rhSetting.model';
import { Leave } from '../Model/leave.model';


@Component({
  selector: 'app-cra-form',
  templateUrl: './cra-form.component.html',
  styleUrls: ['./cra-form.component.scss']
})

export class CRAFormComponent implements OnInit {

  annualLeaves : Leave[]=[];
  sickenessLeaves : Leave[]=[];
  unpaidLeaves : Leave[]=[];
  rttLeaves : Leave[]=[];

  nbBusinessDay:number;
  month: string = ""; // mois choisi dans les paramètres RH pour la saisie du CRA par les consultants
  craForm: FormGroup; // formulaire de saisie du CRA
  semaineForm: FormGroup; // Formulaire pour la saisie des heures supplémentaires
  cra: CRA; // object voir model.CRA 
  pdfBlob: Blob; // objet blob representant le fichier pdf générer après validation du CRA
  csvFile: Blob; // objet blob representant le fichier pdf générer après validation du CRA
  fileIsUploading = false;
  pdfFileUrl: string; // Adresse URL firebase dans laquelle le report pdf sera stocké
  csvFileUrl: string // Adresse URL firebase dans laquelle le report csv sera stocké
  fileUpdloaded = false;
  rhSettingSubcribtion:Subscription; //Souscription au subject RHSetting voir (RhSetting.Service)
  rhSetting: RhSetting; // Object RhSetting dans lequel on stock les données liées à la page RH

  constructor(private formBuilder: FormBuilder,
              private craService: CraService,
              private router: Router,
              private rhSettingService: RHSettingService
              ) { }

  @ViewChild('content') Content: ElementRef;
  @Input() nbOverTime;
  @Input() nbAnnualLeaves;
  @Input() nbRttLeaves;
  @Input() nbSicknessLeaves;
  @Input() nbUnpaidLeaves; 
  @Input() nbWorkDay;

  ngOnInit() {

    this.initForm(); 

    this.rhSettingService.getRHSettingsFromServer();
    this.rhSettingSubcribtion=this.rhSettingService.rhSettingSubject.subscribe(
      (rhSettings: RhSetting)=> {
        this.rhSetting = rhSettings;
        this.month=this.rhSetting.currentMonth;
        let map = new Map([
          ["Janvier", this.rhSetting.nbBusinessDayJan],
          ["Fevrier", this.rhSetting.nbBusinessDayFeb],
          ["Mars", this.rhSetting.nbBusinessDayMar],
          ["Avril", this.rhSetting.nbBusinessDayApr],
          ["Mai", this.rhSetting.nbBusinessDayMay],
          ["Juin", this.rhSetting.nbBusinessDayJun],
          ["Juillet", this.rhSetting.nbBusinessDayJul],
          ["Aout", this.rhSetting.nbBusinessDayAug],
          ["Septembre", this.rhSetting.nbBusinessDaySep],
          ["Octobre", this.rhSetting.nbBusinessDayOct],
          ["Novembre", this.rhSetting.nbBusinessDayNov],
          ["Decembre", this.rhSetting.nbBusinessDayDec]
          ]);
          this.nbBusinessDay = map.get(this.month);
          this.countNbWorkedDay();
      }
    );

  }

  initForm() {

    /** initialiser avec la méthode réactive le template du formulaire de saisie du CRA */
    /** 
    this.rttLeaves=[];
    this.annualLeaves=[];
    this.unpaidLeaves=[];
    this.sickenessLeaves=[];
    this.month="";
    */

    this.nbOverTime=0;
    this.nbAnnualLeaves=0;
    this.nbRttLeaves=0;
    this.nbSicknessLeaves=0;
    this.nbUnpaidLeaves=0;

    this.semaineForm = this.formBuilder.group(
      {
      overtime1 : '',
      weekNum1:'',
      overtime2 : '',
      weekNum2:'',
      overtime3 : '',
      weekNum3:'',
      overtime4 : '',
      weekNum4:'',
      overtime5 : '',
      weekNum5:'',
    });

    this.craForm = this.formBuilder.group({
        month : ['', Validators.required],
        name: ['', Validators.required],
        responsibleName: ['', Validators.required],
        responsibleEmail : ['', [Validators.email, Validators.required]],
        company : ['', Validators.required],
        email : ['', [Validators.email, Validators.required]],
        details : '',
        nbWorkDay : ['',Validators.required],
        craComment : ''
    });

  }

/******************************************************************************* */
  addAnnualLeave(){
    const leave = new Leave();
    leave.leaveType="Annual";
    this.annualLeaves.push(leave);
  }
  removeAnnualLeave(){
    this.annualLeaves.pop();
    this.countTotalAnnualLeaves();
  }

  countTotalAnnualLeaves(){
    this.nbAnnualLeaves =0;
    this.annualLeaves.forEach(element => {
      this.nbAnnualLeaves = this.nbAnnualLeaves + element.nbDay ;
    });
    this.countNbWorkedDay();
  }

  addRttLeave(){
    const leave = new Leave();
    leave.leaveType="RTT";
    this.rttLeaves.push(leave);
  }
  removeRTTLeave(){
    this.rttLeaves.pop();
    this.countTotalRTTLeaves();
  }

  countTotalRTTLeaves(){
    this.nbRttLeaves =0;
    this.rttLeaves.forEach(element => {
      this.nbRttLeaves = this.nbRttLeaves + element.nbDay ;
    });
    this.countNbWorkedDay();
  }

  addSickenessLeave(){
    const leave = new Leave();
    leave.leaveType="Sickness";
    this.sickenessLeaves.push(leave);
  }
  removeSickenessLeave(){
    this.sickenessLeaves.pop();
    this.countTotalSickenessLeaves();
  }

  countTotalSickenessLeaves(){
    this.nbSicknessLeaves =0;
    this.sickenessLeaves.forEach(element => {
      this.nbSicknessLeaves = this.nbSicknessLeaves + element.nbDay ;
    });
    this.countNbWorkedDay();
  }

  addUnpaidLeave(){
    const leave = new Leave();
    leave.leaveType="Unpaid";
    this.unpaidLeaves.push(leave);
  }
  removeUnpaidLeave(){
    this.unpaidLeaves.pop();
    this.countTotalUnpaidLeaves();
  }

  countTotalUnpaidLeaves(){
    this.nbUnpaidLeaves =0;
    this.unpaidLeaves.forEach(element => {
      this.nbUnpaidLeaves = this.nbUnpaidLeaves + element.nbDay ;
    });
    this.countNbWorkedDay();
  }

  countNbWorkedDay(){
    this.nbWorkDay = 0;
    var nbLeaves=0
    this.annualLeaves.forEach(element => {
      nbLeaves = nbLeaves + element.nbDay;
    });
    this.rttLeaves.forEach(element =>{
      nbLeaves = nbLeaves + element.nbDay;
    })
    this.sickenessLeaves.forEach(element =>{
      nbLeaves = nbLeaves + element.nbDay;
    })
    this.unpaidLeaves.forEach(element =>{
      nbLeaves = nbLeaves + element.nbDay;
    })
    this.nbWorkDay = this.nbBusinessDay - nbLeaves;
  }

/** *********************************************************************************************** */
  addOverTime(){
    this.nbOverTime++;
  }
  removeOverTime(){
    this.nbOverTime--;
  }

  arrayOne(num: number){
    const arr = [];
    for (let index = 0; index < num; index++) {
      arr[index]= index+1;
    }
    return arr;
  }
  
  
/** *********************************************************************************************** */

  CreateMailWithDefaultApp(){
/** 
 * Permet d'envoyer sous forme de mail des données du formulaire
 *  ces données pourront être ouverte avec l'application de mail utilisée par défaut par l'utilisateur
  */
    this.dowloadFormToPDFasText();

    const formValue = this.craForm.value;

    const body="Bonjour,"
    +"Veuillez-trouver ci dessous le compte rendu de mon activité mensuelle chez le client TBD."
    + "br/"
    + "Nom Responsable:"
    + "Email: Responsable client: "
    + "Congés:" 
    + "CSS:"
    + "RTT:"
    + "Congés maladie:"
    + "Heures supplémentaires"
    + "Nombre de jours ouvrés: "
    + "Nombre de jours travaillés:"
    + "Bien cordialement,";

    const body2="Veuillez-trouver%20ci%20dessous%20le%20compte%20rendu%20de%20mon%20activit%C3%A9%20mensuelle%20chez%20le%20client%20"+ formValue['company']+
    ".%0A%0ANom%20Responsable%3A%20"+ formValue['responsibleName']+
    "%0AEmail%3A%20" + formValue['responsibleEmail']+ 
    "%0ACong%C3%A9s%3A" + this.nbAnnualLeaves +
    "%0ACSS%3A%20" + this.nbUnpaidLeaves +
    "%0ARTT%3A%20" + this.nbRttLeaves +
    "%0ACong%C3%A9s%20maladie%3A%20" + this.nbSicknessLeaves + 
    "%0AHeures%20suppl%C3%A9mentaires" + 'TBD' +
    "%0ANombre%20de%20jours%20ouvr%C3%A9s%3A%20"+ this.nbBusinessDay +
    "%0ANombre%20de%20jours%20travaill%C3%A9s%3A" + this.nbWorkDay + "%0ABien%20cordialement%2C%0A";
    
    //const formValue = this.craForm.value;
    window.location.href="mailto:" + this.rhSetting.emailRH + "?subject=CRA%20%5BPensez%20%C3%A0%20Ajouter%20les%20pieces%20jointes%5D&amp&body="+body2;
    
  }

  dowloadFormToPDFasText() {
    /**
     * Récapitule dans une fichier PDF les données saisies par l'utilisateur dans le formulaire
     */
    const formValue = this.craForm.value;

    const pipe = new DatePipe('en-FR');
    const now = Date.now();
    const myFormattedDate = pipe.transform(now, 'longDate');
    const signature = 'Signature: ' + formValue['name'];

    const docPDF = new jsPDF('p', 'mm', 'a4');
    let iRow = 20;

// Date et signature en base de page:
    docPDF.setFontSize(12);
    docPDF.text(myFormattedDate, 10, 277);
    docPDF.text(signature, 100, 277);

//Titre du document: CRA mois nom du consultant en taille 18
    docPDF.setFontSize(18);
    const title = 'Compte-Rendu d'+"'"+'Avancement Mensuel \n' + this.month + ' ' + formValue['name'];
    docPDF.text(title, 105, iRow,null,null,'center');
    
    iRow=iRow+20;

// Information sur les responsable client:
    docPDF.setFontSize(10);
    const responsibleInfo = 'Responsable client: ' + formValue['responsibleName']+ '\n' + ' Email: ' + formValue['responsibleEmail'];
    docPDF.text(responsibleInfo, 20, iRow);

    iRow=iRow+10;

// Information sur le consultant:
    const consultantInfo = 'Consultant: ' + formValue['name'] + '\n' + ' Email: ' + formValue['email'] ;
    docPDF.text(consultantInfo, 20, iRow);

    iRow=iRow+10;

// Congés Annuels:
    docPDF.text('Congés Annuels :',20, iRow); 
    iRow=iRow+5;
    let i = 0;
    //docPDF.text(annualLeaveToString, 20, 50 + this.annualLeaves.length*10);
    this.annualLeaves.forEach(element => {
      var annualLeaveToString = 
                          element.nbDay + ' jour(s) pris entre le ' + 
                          element.dateBegin + ' et le '+ 
                          element.dateEnd;
      //console.log(annualLeaveToString);
      docPDF.text(annualLeaveToString,20,iRow+i);
        i=i+5;
    });

    if (this.annualLeaves.length >0 ){
      iRow=iRow+10;
    }

// Congés Sans Solde:
    docPDF.text('Congés Sans Solde :',20, iRow); 
    if (this.unpaidLeaves.length = 0 ){
      docPDF.text('Aucun à déclarer',40 , iRow); 
    }
    iRow=iRow+5;
    i = 0;
    this.unpaidLeaves.forEach(element => {
      var unpaidLeaveToString = 
                          element.nbDay + ' jour(s) pris entre le ' + 
                          element.dateBegin + ' et le '+ 
                          element.dateEnd + '\n';
      //console.log(unpaidLeaveToString);
      docPDF.text(unpaidLeaveToString,20,iRow+i);
        i=i+5;
    });

    if (this.unpaidLeaves.length >0 ){
      iRow=iRow+10;
    }

// Congés Maladie:
    docPDF.text('Congés Maladie :',20, iRow); 
    iRow=iRow+10;
    i = 0;
    this.sickenessLeaves.forEach(element => {
      var sicknessLeaveToString = 
                          element.nbDay + ' jour(s) pris entre le ' + 
                          element.dateBegin + ' et le '+ 
                          element.dateEnd + '\n';
      //console.log(sicknessLeaveToString);
      docPDF.text(sicknessLeaveToString,20,iRow+i);
        i=i+5;
    });

    if (this.sickenessLeaves.length >0 ){
      iRow=iRow+10;
    }

// RTT:
    docPDF.text('RTT :',20, iRow); 
    iRow=iRow+10;
    i = 0;
    this.rttLeaves.forEach(element => {
      var rttLeaveToString = 
                          element.nbDay + ' jour(s) pris entre le ' + 
                          element.dateBegin + ' et le '+ 
                          element.dateEnd + '\n';
      //console.log(rttLeaveToString);
      docPDF.text(rttLeaveToString,20,iRow+i);
        i=i+5;
    });

    if (this.rttLeaves.length >0 ){
      iRow=iRow+10;
    }
//Heures Supplémentaires:
    const overtimeW1 = 'Heures supplémentaire S1: ' + formValue['overtimeW1'];
    const overtimeW2 = 'Heures supplémentaire S2: ' + formValue['overtimeW2'];
    const overtimeW3 = 'Heures supplémentaire S3: ' + formValue['overtimeW3'];
    const overtimeW4 = 'Heures supplémentaire S4: ' + formValue['overtimeW4'];
    const overtimeW5 = 'Heures supplémentaire S5: ' + formValue['overtimeW5'];

    if (formValue['overtimeW1'] > 0) {
      docPDF.text(overtimeW1, 20, iRow);
      iRow=iRow+5;
    };
    if (formValue['overtimeW2'] > 0) {
      docPDF.text(overtimeW2, 20, iRow);
      iRow=iRow+5;
    };
    if (formValue['overtimeW3'] > 0) {
      docPDF.text(overtimeW3, 20, iRow);
      iRow=iRow+5;
    };
    if (formValue['overtimeW4'] > 0) {
      docPDF.text(overtimeW4, 20, iRow);
      iRow=iRow+5;
    };
    if (formValue['overtimeW5'] > 0) {
      docPDF.text(overtimeW5, 20, iRow);
    };

    iRow=iRow+10;

// Nombre de jour travaillé vs nombre de jour ouvrés:
    docPDF.setFontType('bold');
    const nbWorkDay = 'Nombre de jour travaillé : ' + this.nbWorkDay;
    docPDF.text('Nombre de jour ouvré: '+this.nbBusinessDay, 20, iRow);
    iRow=iRow+5;
    docPDF.text(nbWorkDay,20, iRow);

    iRow=iRow+10;

// Ajout du commentaire:
    docPDF.setFontType('regular');
    let arrayComment = docPDF.splitTextToSize(formValue['craComment'],180);

    if (iRow + arrayComment.length*5 > 275){
      docPDF.addPage();
      iRow=20;
      docPDF.text(myFormattedDate, 10, 277);
      docPDF.text(signature, 100, 277);
    }

    i = 0;
    docPDF.text('Commentaires: \n',20,iRow);
    iRow=iRow+10;
    arrayComment.forEach(element => {
      docPDF.text(element, 20,iRow +i);
      i=i+5;
    });
    
// Page dédiée au détail de la mission:
    docPDF.addPage();
    const details = 'Détail Mission: \n ' + formValue['details'];
    i=0;
    let arrDetail = docPDF.splitTextToSize(details,180);
    arrDetail.forEach(element => {
      docPDF.text(element,20,20+i);
      i=i+5;
    });
    
    docPDF.setFontSize(12);
    docPDF.text(myFormattedDate, 10, 277);
    docPDF.text(signature, 100, 277);

// Set le nom du document:

    const docName='cra_'+ formValue['name'] +'_'+  myFormattedDate + '.pdf';
    docPDF.save(docName);
    
    this.pdfBlob = docPDF.output('blob');

    //this.onUploadPdfFile(pdf,docName);
/** 
    //this.docURL = URL.createObjectURL(pdf);
    //const data = new FormData();
    //data.append('data' , pdf);
    //this.fileUrl = this.craService.uploadPdfFile(pdf);
*/

  }

  

  saveDataInCSVFile(){

    const formValue = this.craForm.value;
    
    var options = { 
      fieldSeparator: ',',
      //quoteStrings: '"',
      //decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Donnée CRA',
      //useBom: true,
      //noDownload: true,
      headers: [
        "mois", 
        "Nom ", 
        "email",
        "Nom du responsable", 
        "email du responsable", 
        "jours travaillés", 
        "congés payés", 
        "Congés maladie", 
        "RTT",
        "Congés sans solde",
        "lien vers version PDF"],
      //nullToEmptyString: true,
    };

    const dataCRA=[
      {
      month: formValue['month'],
      name: formValue['name'],
      email: formValue['email'],
      nameResponsible: formValue['responsibleName'],
      emailResponsible: formValue['responsibleEmail'],
      nbWorkDay: formValue['nbWorkDay'],
      nbALeave : this.nbAnnualLeaves,
      nbSLeave : this.nbSicknessLeaves,
      nbRtt : this.nbRttLeaves,
      nbSSLeave : this.nbUnpaidLeaves,
      link: this.pdfFileUrl,
      }
    ];

    //this.csvFile = new Angular5Csv(dataCRA, 'CRA'+formValue['name']+'_'+formValue['mois'], options);
    const strHeader = 'Mois, Nom Consultant, Email, Nom Responsable, EmailResponsable,'
    +'Nombre de Jours Travaillé, Nombre de Congés Annuel,'+
    'Nombre de Congés Maladie, Nombre de RTT, Nombre de congés sans solde\n';

    const str = formValue['month']+','+ formValue['name'] +','+ formValue['email'] +','+
     formValue['responsibleName']+','+
     formValue['responsibleEmail']+','+
     formValue['nbWorkDay']+','+
     this.nbAnnualLeaves+','+
     this.nbSicknessLeaves+','+
     this.nbRttLeaves+','+
     this.nbUnpaidLeaves+'\n';

    this.csvFile = new Blob([strHeader,str],{ type: 'text/csv;charset=utf8' });
    var url = window.URL.createObjectURL(this.csvFile);
    console.log('csv:'+this.csvFile);

  }

  onSend() {
    /** Lors de l'envoie des du formulaire
     * on propose à l'utilisateur d'envoyer via sa messagerie par défaut les données saisie
     * de plus des versions pdf et csv sont télécharger 
     */
    this.CreateMailWithDefaultApp();
    this.dowloadFormToPDFasText();
    this.saveDataInCSVFile();
    
  }

  onSave(){

      /** Lors de l'enregistrement du formulaire :
       * le données stockées en csv et le fichier pdf sont envoyé en base
       * on créer ensuite un object de type CRA pour envoyer ces données en base également
       */

      const formValue = this.craForm.value;
      const formOverTimeValue= this.semaineForm;
  
      const newOvertime= new Overtime(
        formOverTimeValue['overTime1'],
        formOverTimeValue['weekNum1'],
        formOverTimeValue['overTime2'],
        formOverTimeValue['weekNum2'],
        formOverTimeValue['overTime3'],
        formOverTimeValue['weekNum3'],
        formOverTimeValue['overTime4'],
        formOverTimeValue['weekNum4'],
        formOverTimeValue['overTime5'],
        formOverTimeValue['weekNum5']
      );
  
      const newCra = new CRA(
          formValue['month'],
          formValue['name'],
          formValue['responsibleName'],
          formValue['responsibleEmail'],
          formValue['email'],
          formValue['details'],
          this.annualLeaves,
          this.sickenessLeaves,
          this.rttLeaves,
          this.unpaidLeaves,
          this.nbAnnualLeaves,
          this.nbUnpaidLeaves,
          this.nbSicknessLeaves,
          this.nbRttLeaves,
          newOvertime,
          formValue['craComment'],
      );
      
    this.craService.uploadCsvFile(this.csvFile, 'CRA.csv').then(
      (url:string)=>{
        this.fileUpdloaded = true;
        //this.csvFileUrl = url;
        newCra.csvFileUrl = url;
        console.log("CVS saved here : "+ url);

        this.craService.uploadPdfFile(this.pdfBlob, 'CRA.pdf').then(
          (url:string)=>{
            //this.pdfFileUrl = url;
            newCra.pdfFileUrl = url
            console.log("PDF saved here : "+ url);
            this.craService.createNewCRA(newCra);
          }
        );

      }
    );
    
    
    //this.router.navigate(['app-home']);
  }






/** ! NO USED ANYMORE ! */
  onUploadPdfFile(pdf: Blob, fileName: string){

    this.craService.uploadPdfFile(pdf, fileName).then(
      (url:string)=>{
        this.fileUpdloaded = true;
        this.pdfFileUrl = url;
        console.log("PDF saved here : "+url);
        //this.onSubmitForm();
      }
    );
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
}
