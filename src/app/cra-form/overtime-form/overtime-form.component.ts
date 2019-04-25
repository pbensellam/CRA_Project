import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OvertimeService } from 'src/app/Service/overtime.service';
import { Overtime } from 'src/app/Model/overtime.model';

@Component({
  selector: 'app-overtime-form',
  templateUrl: './overtime-form.component.html',
  styleUrls: ['./overtime-form.component.scss']
})
export class OvertimeFormComponent implements OnInit {
  
  
  @ViewChild('content') Content: ElementRef;

  allOverime : Overtime[]=[]; // Initialise le form avec un tableau d'object overtime vide
  overtimeTypes : string[] = ['Heures Supplémentaire', 'VSD', 'Astreinte', 'Astreinte avec déplacement', 'Heure de nuit'];
  nbOvertime1: number = 0; // heures supp
  nbOvertime2: number = 0;// vsd
  nbOvertime3: number = 0; // astreinte
  nbOvertime4: number = 0; // Astreinte avec déplacement 
  nbOvertime5: number = 0; // heure de nuit
  nbOvertimeTotal: number = 0; // Total global
  nb: number;
  constructor(private overtimeService: OvertimeService) { }

  ngOnInit() {
    this.nb= 0 ;
    this.overtimeService.otSubject.subscribe(
      (overtimeData)=>
      {
        this.allOverime = overtimeData;
      },
      (error)=>{
        console.log('Erreur avec la souscription des données overtime' + error);
      }
    );
    this.overtimeService.emitOvertimeData(this.allOverime);
    this.countOvertime();

  }

  addOvertimePeriod(){

    const overtime = new Overtime();
    this.allOverime.push(overtime);
    this.overtimeService.emitOvertimeData(this.allOverime);
    this.countOvertime();
    
  }

  removeOvertimePeriod(index :number){
    this.allOverime.splice(index,1);
    this.overtimeService.emitOvertimeData(this.allOverime);
    this.countOvertime();
  }

  countOvertime():number{
    
    this.nbOvertime1 = 0;
    this.nbOvertime2 = 0;
    this.nbOvertime3 = 0;
    this.nbOvertime4 = 0;
    this.nbOvertime5 = 0;

    this.allOverime.forEach(element => {
      switch (element.type) {
        case 'Heures Supplémentaire':
          this.nbOvertime1 = this.nbOvertime1 + element.value;
          break;
        case 'VSD':
          this.nbOvertime2 = this.nbOvertime2+ element.value;
          break;
        case 'Astreinte':
          this.nbOvertime3 = this.nbOvertime3 + element.value;
          break;
        case 'Astreinte avec déplacement':
          this.nbOvertime4 = this.nbOvertime4 + element.value;
          break;
        case 'Heures de nuit':
          this.nbOvertime5 = this.nbOvertime5 + element.value;
          break;
      
        default:
          break;
      }
      this.nbOvertimeTotal = this.nbOvertime1 + this.nbOvertime2 + this.nbOvertime3 + this.nbOvertime4 + this.nbOvertime5;
      //console.log(this.nbOvertimeTotal);
    });
    return this.nbOvertimeTotal;
  }
  

}
