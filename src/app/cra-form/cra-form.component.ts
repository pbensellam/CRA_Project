import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CraService } from '../Service/cra.service';
import { CRA } from '../Model/cra.model';
import * as jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import { Input } from '@angular/core';
import {  Overtime } from '../Model/overtime.model';
import { RHSettingService } from '../Service/rhSetting.service';
import { Subscription } from 'rxjs';
import { RhSetting } from '../Model/rhSetting.model';
import { Leave } from '../Model/leave.model';
import { LeaveService } from '../Service/leave.service';
import { OvertimeService } from '../Service/overtime.service';
import { Constants } from '../constants';
import { FileUtil } from '../file.util';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv'
import { Papa } from 'ngx-papaparse';
import { isUndefined } from 'util';

@Component({
  selector: 'app-cra-form',
  templateUrl: './cra-form.component.html',
  styleUrls: ['./cra-form.component.scss']
})

export class CRAFormComponent implements OnInit {

  allLeaves : any[] =[];
  allOvertime : Overtime[] = [];
  annualLeaves : Leave[]=[];
  sickenessLeaves : Leave[]=[];
  unpaidLeaves : Leave[]=[];
  rttLeaves : Leave[]=[];

  //isFormValid : boolean = false;
  nbBusinessDay:number; // Nombre de jour ouvré
  month: string = ""; // mois choisi dans les paramètres RH pour la saisie du CRA par les consultants
  craForm: FormGroup; // formulaire de saisie du CRA
  cra: CRA; // object voir model.CRA 
  pdfBlob: Blob; // objet blob representant le fichier pdf générer après validation du CRA
  csvFile: Blob; // objet blob representant le fichier pdf générer après validation du CRA
  fileIsUploading = false;
  pdfFileUrl: string; // Adresse URL firebase dans laquelle le report pdf sera stocké
  csvFileUrl: string // Adresse URL firebase dans laquelle le report csv sera stocké
  fileUpdloaded = false;
  rhSettingSubcribtion:Subscription; //Souscription au subject RHSetting voir (RhSetting.Service)
  rhSetting: RhSetting; // Object RhSetting dans lequel on stock les données liées à la page RH
  fileImportInput: any;
  csvRecords = [];

  constructor(private formBuilder: FormBuilder,
              private craService: CraService,
              private router: Router,
              private rhSettingService: RHSettingService,
              private leaveService : LeaveService,
              private overtimeService : OvertimeService,
              private _fileUtil: FileUtil,
              private papa: Papa
              ) { }

  @ViewChild('content') Content: ElementRef;
  @ViewChild('fileImportInput')
  @Input() nbWorkDay;
  //@Input() isFormValid: boolean = false;

  ngOnInit() {

    this.initForm(); 
    /**
     * On recupère ici les informations RH en base afin de mettre à jour le mois en cours 
     * et le nombre de jour ouvrés 
     */
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

    this.leaveService.currentLeaveData.subscribe(
      (leaves) => {
        this.allLeaves = leaves;
      },
      error => {
        console.log('Erreur lors de la souscription au service des congés' + error);
      }
    );


  }

  initForm() {

    /** 
     * initialiser avec la méthode réactive le template du formulaire de saisie du CRA 
     * 
    */

    this.craForm = this.formBuilder.group({
        month : '',
        name: ['', Validators.required],
        responsibleName: ['', Validators.required],
        responsibleEmail : ['', [Validators.email, Validators.required]],
        company : ['', Validators.required],
        email : ['', [Validators.email, Validators.required]],
        details : '',
        nbWorkDay : '',
        craComment : ''
    });

  }
  
  
/** *********************************************************************************************** */

  onSend() {
    /** Lors de l'envoie des du formulaire
     * on propose à l'utilisateur d'envoyer via sa messagerie par défaut les données saisie
     * de plus des versions pdf et csv sont télécharger 
     */
    //console.log (this.isFormValid);
    //this.CreateCSVfileFromFormData();
    //this.saveDataInCSVFile();
    this.CreateMailWithDefaultApp();
    //this.dowloadFormToPDFasText();
    //window.print();

    //this.isFormValid = true;
    //console.log (this.isFormValid);
  }
  onSave(){

    /** 
     * Lors de l'enregistrement du formulaire :
     * le données stockées en csv (lors de l'envoie de du formualire cf onSend) 
     * et sont envoyé en base grace au service craService.uploadCsvFile()
     * on créer ensuite un object de type CRA pour envoyer ces données en base également
     */

    const formValue = this.craForm.value;
    this.countNbWorkedDay();

  //souscription aux services des congés et des heures Supp afin de récupérer les donnée et les associer à l'object CRA 

    this.overtimeService.otSubject.subscribe(
      (overtimeData)=>
      {
        this.allOvertime = overtimeData;
        newCra.overtimes = overtimeData;
      },
      (error)=>{
        console.log('Erreur avec la souscription des données overtime' + error);
      }
    );

    this.leaveService.currentLeaveData.subscribe(
          (leaves) => {
            this.allLeaves = leaves;
            newCra.leavesArray = leaves;
          },
          error => {
            console.log('Erreur lors de la souscription au service congés' + error);
          }
    );

    const newCra = new CRA(
        this.month,
        formValue['name'],
        formValue['company'],
        formValue['responsibleName'],
        formValue['responsibleEmail'],
        formValue['email'],
        formValue['details'],
        this.allLeaves,
        this.allOvertime,
        formValue['craComment'],
    );
    newCra.nbWorkDay = formValue['nbWorkDay'];
    newCra.csvFileUrl = '';
      
    if (isUndefined(this.csvFile)){
        console.log(this.csvFile);
        this.craService.createNewCRA(newCra);
    }
    else{    
        this.craService.uploadCsvFile(this.csvFile, 'CRA.csv').then(
          (url:string)=>{
            this.fileUpdloaded = true;
            //this.csvFileUrl = url;
            newCra.csvFileUrl = url;
            console.log("CVS saved here : "+ url);
  /*
            this.craService.uploadPdfFile(this.pdfBlob, 'CRA.pdf').then(
              (url:string)=>{
                //this.pdfFileUrl = url;
                newCra.pdfFileUrl = url
                console.log("PDF saved here : "+ url);
                this.craService.createNewCRA(newCra);
              }
            );
  */
          }
        );
      }
  /*
  this.getCRAFormData().then(
    (data)=>{
      const newCra = new CRA(
        formValue['month'],
        formValue['name'],
        formValue['company'],
        formValue['responsibleName'],
        formValue['responsibleEmail'],
        formValue['email'],
        formValue['details'],
        this.allLeaves,
        this.allOvertime,
        formValue['craComment'],
    );
    console.log(this.csvFile);
    if (this.csvFile === null){
      this.craService.createNewCRA(newCra);
    }
    else{
      this.craService.uploadCsvFile(this.csvFile, 'CRA.csv').then(
        (url:string)=>{
          //this.fileUpdloaded = true;
          newCra.csvFileUrl = url;
          console.log("CVS saved here : "+ url);
          this.craService.createNewCRA(newCra);
          this.router.navigate(['app-home']);
        }
      );
    }
  });
  */
  
  //this.router.navigate(['app-home']);
  } 

  getCRAFormData(){
    return new Promise((resolve, reject)=>{
      this.overtimeService.otSubject.subscribe(
        (overtimeData)=>
        {
          this.allOvertime = overtimeData;
          this.leaveService.currentLeaveData.subscribe(
              (leaves) => {
                resolve(this.allLeaves = leaves);
              },
              error => {
                reject(console.log('Erreur lors de la souscription au service congés' + error));
              }
          );
        },
        (error)=>{
          reject(console.log('Erreur avec la souscription des données overtime' + error));
        }
      );
    });

  }

 

  createCRAfromForm():CRA{

    const formValue = this.craForm.value;
    
    //this.getCurrentLeavesData();
    //this.getCurrentOvertimesData();
    this.leaveService.currentLeaveData.subscribe(
      (leaves) => {
        this.allLeaves = leaves;
      },
      error => {
        console.log('Erreur lors de la souscription au service congés' + error);
      }
    );

    this.overtimeService.otSubject.subscribe(
      (overtimeData)=>
      {
        console.log(overtimeData);
        //console.log(this.allOvertime);          
        this.allOvertime = overtimeData;
      },
      (error)=>{
        console.log('Erreur avec la souscription des données overtime' + error);
      }
    );

    const newCra = new CRA(
            formValue['month'],
            formValue['name'],
            formValue['company'],
            formValue['responsibleName'],
            formValue['responsibleEmail'],
            formValue['email'],
            formValue['details'],
            this.allLeaves,
            this.allOvertime,
            formValue['craComment'],
    );
    return newCra;
  }

  countNbWorkedDay(){
/**
 * permet de mettre à jour le décompte du nombre de jour travaillé en fonction des 
 * jours de congés saisie dans le formulaire
 */

    this.leaveService.currentLeaveData.subscribe(
      (leaves) => {
        this.allLeaves = leaves;
        this.nbWorkDay = 0;
        var nbLeaves=0;
        this.allLeaves.forEach(arrLeave =>{
          arrLeave.forEach(leave=>{
            nbLeaves = nbLeaves + leave.nbDay;
          });
        });
        //console.log(nbLeaves);
        this.nbWorkDay = this.nbBusinessDay - nbLeaves;
      },
      error => {
        console.log('Erreur lors de la souscription au service Overtime' + error);
      }
    );

    
  }

  loadDataInForm(data){
/**
 * Depuis les données lu dans le fichier mis en input lors de l'ouverture du formulaire
 * on met ici à jour chaque champs avec les données contenue dans l'array @param data
 */

    const formValue = this.craForm;
    formValue.setValue(
      {
      month:data[0],
      name:data[1],
      email:data[2], 
      responsibleName:data[3], 
      responsibleEmail:data[4],
      nbWorkDay:this.nbBusinessDay, 
      company:data[5], 
      details:data[17], 
      craComment:data[18]}
    );

  }

  fileChangeListener($event):void{
    /**
     * Listener sur l'ajout ou modification du fichier sources des données CRA
     * @param $event permet de recuperer le fichier sources
     * On commence par tester la validiter du type de fichier choisi (csv ONLY !)
     * si le fichier est valide on lit les données du fichier grâce à 'FileReader"
     * Puis avec Papa Parse @link voir tuto : https://alberthaff.dk/projects/ngx-papaparse/docs/v3/installation 
     * on transforme les données lu au format csv en Array
     * que l'on renvoie ensuite vers la fonction @see loadDataInForm pour mettre à jour le 
     * formulaire avec les données lues.
     */
    var files = $event.srcElement.files;
    if(Constants.validateHeaderAndRecordLengthFlag){
      if(!this._fileUtil.isCSVFile(files[0])){
        alert("Please import valid .csv file.");
        this.fileReset();
      }
    }

    var input = $event.target;
    var reader = new FileReader();
    reader.readAsText(input.files[0]);
    let options = {
      complete: (results, file) => {
          //console.log('Parsed: ', results, file);
          console.log(results.data[1]);
          this.loadDataInForm(results.data[1])
      }
      // Add your options here
    };
    this.papa.parse(input.files[0],options);
    //console.log(craData);
  }

  fileReset(){
    this.fileImportInput.nativeElement.value = "";
    this.csvRecords = [];
  }

  CreateMailWithDefaultApp(){
    /** 
     * Permet d'envoyer sous forme de mail des données du formulaire
     *  ces données pourront être ouverte avec l'application de mail utilisée par défaut par l'utilisateur
      */
        //this.dowloadFormToPDFasText();
        const mCRA = this.createCRAfromForm();
        const formValue = this.craForm.value;
        //console.log(mCRA.overtimes);
        //console.log(mCRA.countOvertime());

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
        ".%0A%0ANom%20Responsable%3A%20"+ mCRA.responsibleName+
        "%0AEmail%3A%20" + mCRA.responsibleEmail+ 
        "%0ACong%C3%A9s%3A%20" + mCRA.countLeavebyType("Annual") +
        "%0ACSS%3A%20" + mCRA.countLeavebyType('Unpaid') +
        "%0ARTT%3A%20" + mCRA.countLeavebyType('RTT') +
        "%0ACong%C3%A9s%20Exceptionnels%3A%20" + mCRA.countLeavebyType("Exceptional") +
        "%0ACong%C3%A9s%20maladie%3A%20" + mCRA.countLeavebyType('Sickness') + 
        "%0AHeures%20suppl%C3%A9mentaires%3A%20" + mCRA.countOvertime() +
        "%0ANombre%20de%20jours%20ouvr%C3%A9s%3A%20"+ this.nbBusinessDay +
        "%0ANombre%20de%20jours%20travaill%C3%A9s%3A" + (this.nbBusinessDay - mCRA.countLeaves()) + "%0ABien%20cordialement%2C%0A";
        
        //const formValue = this.craForm.value;
        window.location.href="mailto:" + this.rhSetting.emailRH + "?subject=CRA%20%5BPensez%20%C3%A0%20Ajouter%20les%20pieces%20jointes%5D&amp&body="+body2;
        
    }

  CreateCSVfileFromFormData(){
/**
 * On creer et telecharge un fichier csv à partir des données du formulaire
 * voir ce tuto:
 * https://www.code-sample.com/2019/02/angular-7-export-to-csv-pdf-excel.html
 */
    const mCRA = this.createCRAfromForm();
  
    const formValue = this.craForm.value;
    var options = { 
      fieldSeparator: ',',
      //quoteStrings: '"',
      //decimalseparator: '.',
      showLabels: true, 
      //showTitle: true,
      //title: 'Donnée CRA',
      //useBom: true,
      //noDownload: true,
      headers: [
        "Mois", 
        "Nom", 
        "Email consultant",
        "Nom du responsable", 
        "email du responsable",
        "Entreprise", 
        "Jours travaillés", 
        "Congés payés", 
        "Congés maladie", 
        "RTT",
        "Congés sans solde",
        ,"Exceptionnel",
        "VSD",
        "Astreinte",
        "Astreinte avec déplacement",
        "Heures supplémentaire",
        "Heures de nuit",
        "Details",
        "Commentaire"
      ]
    };
  
    const dataCRA=[
      {
      month: mCRA.month,
      name: mCRA.name,
      email: mCRA.email,
      nameResponsible: mCRA.responsibleName,
      emailResponsible: mCRA.responsibleEmail,
      company: mCRA.company,
      nbWorkDay: this.nbBusinessDay - mCRA.countLeaves(),
      nbLeave1 : mCRA.countLeavebyType('Annual'),
      nbLeave2 : mCRA.countLeavebyType('Maladie'),
      nbLeave3 : mCRA.countLeavebyType('RTT'),
      nbLeave4 : mCRA.countLeavebyType('Sans Solde'),
      nbLeave5 : mCRA.countLeavebyType('Exceptionnel'),
      nbOvertime1 : mCRA.countOvertimebyType('VSD'),
      nbOvertime2 : mCRA.countOvertimebyType('Astreinte'),
      nbOvertime3 : mCRA.countOvertimebyType('Astreinte avec déplacement'),
      nbOvertime4 : mCRA.countOvertimebyType('Heures supplémentaire'),
      nbOvertime5 : mCRA.countOvertimebyType('Heures de nuit'),
      Detail : mCRA.details,
      Commentaire : mCRA.craComment,
      }
    ];
    new AngularCsv(dataCRA, 'CRA'+formValue['name']+'_'+formValue['mois'], options);

    //console.log(new AngularCsv(dataCRA, 'CRA'+formValue['name']+'_'+formValue['mois'], options));
   }

   saveDataInCSVFile(){
/**
 * a la différence de 'CreateCSVfileFromFormData()' ici l'on créer un fichier blob
 * pour pouvoir envoyer ensuite ce fichier en base 
 * je n'y arrivait pas autrement.
 * donc ici on chercher simplement à modifier l'object @this csvFile
 */
    const mCRA = this.createCRAfromForm();

    //const formValue = this.craForm.value;
    
    const strHeader = 'Mois, Nom Consultant, Email, Nom Responsable, EmailResponsable,'
    +'Nombre de Jours Travaillé, Nombre de Congés Annuel,'+
    'Nombre de Congés Maladie, Nombre de RTT, Congés sans solde, Congés Exceptionnels,'+
    'VSD, Astreinte, Astreinte avec déplacement, Heures supplémentaire, Heures de nuit,'+
    'Details, Commentaire\n';

    const str =  mCRA.month +','+ mCRA.name +','+ mCRA.email +','+
      mCRA.responsibleName+','+
      mCRA.responsibleEmail+','+
      (this.nbBusinessDay-mCRA.countLeaves())+','+
      mCRA.countLeavebyType('Annual')+','+
      mCRA.countLeavebyType('Maladie')+','+
      mCRA.countLeavebyType('RTT')+','+
      mCRA.countLeavebyType('Sans solde')+','+
      mCRA.countLeavebyType('Expectionnel')+','+
      mCRA.countOvertimebyType('VSD')+','+
      mCRA.countOvertimebyType('Astreinte')+','+
      mCRA.countOvertimebyType('Astreinte avec déplacement')+','+
      mCRA.countOvertimebyType('Heures supplémentaire')+','+
      mCRA.countOvertimebyType('Heures de nuit')+','+
      mCRA.details+','+mCRA.craComment;

    this.csvFile = new Blob([strHeader,str],{ type: 'text/csv;charset=utf8' });
    var url = window.URL.createObjectURL(this.csvFile);
    window.open(url);
    //console.log('csv:'+this.csvFile);

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
    
    if (this.unpaidLeaves.length == 0 ){
      iRow=iRow+5;
      docPDF.text('Aucun à déclarer',40 , iRow); 
    }

    iRow=iRow+5;
    i = 0;
    this.allLeaves.forEach(element => {
        if (element.leaveType ='Unpaid'){
            var unpaidLeaveToString = 
                                element.nbDay + ' jour(s) pris entre le ' + 
                                element.dateBegin + ' et le '+ 
                                element.dateEnd + '\n';
            //console.log(unpaidLeaveToString);
            docPDF.text(unpaidLeaveToString,20,iRow+i);
              i=i+5;
        }
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

// Set le nom du document et le télécharge:

    const docName='cra_'+ formValue['name'] +'_'+  myFormattedDate + '.pdf';
    this.pdfBlob = docPDF.output('blob');
    docPDF.save(docName);

    //this.onUploadPdfFile(pdf,docName);
/** 
    //this.docURL = URL.createObjectURL(pdf);
    //const data = new FormData();
    //data.append('data' , pdf);
    //this.fileUrl = this.craService.uploadPdfFile(pdf);
*/

  }

  /** *********************************************************************************************** */

  arrayOne(num: number){
    /**
     * Allows to create an array of number from 1  to num  
     */
    const arr = [];
    for (let index = 0; index < num; index++) {
      arr[index]= index+1;
    }
    return arr;
  }


  getCurrentOvertimesData(){
      
    this.overtimeService.otSubject.subscribe(
    (overtimeData)=>
    {
      console.log(overtimeData);
      console.log(this.allOvertime);          
      this.allOvertime = overtimeData;
    },
    (error)=>{
      console.log('Erreur avec la souscription des données overtime' + error);
    }
  );
}

getCurrentLeavesData(){
  this.leaveService.currentLeaveData.subscribe(
    (leaves) => {
      this.allLeaves = leaves;
    },
    error => {
      console.log('Erreur lors de la souscription au service congés' + error);
    }
);
}

/** ! NO USED ANYMORE ! */
/*
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
    const docPDF = new jsPDF();

     //docPDF.addHTML(input,function(){
      //docPDF.save('FileWithaddHTML.pdf');
    }) 
    docPDF.fromHTML(document.getElementById('div-responsible'),20,10);
    docPDF.setFontSize(10);
    docPDF.fromHTML(document.getElementById('annual-leave'),20,20);
    //docPDF.fromHTML(document.getElementById('div-details'),20,150);
    docPDF.fromHTML(document.getElementById('div-details'),20,50);
    this.downloadFormToPDFasImage(docPDF, 65, 'details');
    docPDF.save('file.pdf');
  }
  */

}
