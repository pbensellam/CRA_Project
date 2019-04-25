import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Leave } from 'src/app/Model/leave.model';
import { LeaveService } from 'src/app/Service/leave.service';

@Component({
  selector: 'app-leave-form',
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.scss']
})

export class LeaveFormComponent implements OnInit {

  allLeaves: any[]=[];
  annualLeaves : Leave[]=[];
  sickenessLeaves : Leave[]=[];
  unpaidLeaves : Leave[]=[];
  rttLeaves : Leave[]=[];
  exceptionnalLeaves : Leave[]=[];
  nbBusinessDay: number;
  nbAnnualLeaves:number=0;
  nbRttLeaves:number=0;
  nbSicknessLeaves:number=0;
  nbUnpaidLeaves:number=0;
  nbExceptionnalLeaves:number=0;

  constructor(
    private leaveService: LeaveService) { }
  
  @ViewChild('content') Content: ElementRef;

  ngOnInit() {

    this.leaveService.currentLeaveData.subscribe(
      (leaves) => {
        this.allLeaves = leaves;
      },
      error => {
        'Erreur lors de la souscription au service Overtime' + console.log(error());
      }
      );
    this.leaveService.emitLeaveData(this.allLeaves);
  }

  addLeave(stype:string){
    const leave = new Leave();
    this.allLeaves=[];
    switch (stype) {
      case 'Annual':
        leave.leaveType = stype;
        this.annualLeaves.push(leave);
        //this.allLeaves.push(this.annualLeaves);
        break;
      case 'RTT':
        leave.leaveType = stype;
        this.rttLeaves.push(leave);
        //this.allLeaves.push(this.rttLeaves);
        break;
      case 'Sickness':
        leave.leaveType = stype;
        this.sickenessLeaves.push(leave);
        //this.allLeaves.push(this.sickenessLeaves);
        break;
      case 'Unpaid':
        leave.leaveType = stype;
        this.unpaidLeaves.push(leave);
        //this.allLeaves.push(this.unpaidLeaves);
        break;
      case 'Exceptional':
        leave.leaveType = stype;
        this.exceptionnalLeaves.push(leave);
        //this.allLeaves.push(this.exceptionnalLeaves);
        break;
      default:
        break;
    }
    this.allLeaves.push(this.annualLeaves);
    this.allLeaves.push(this.rttLeaves);
    this.allLeaves.push(this.sickenessLeaves);
    this.allLeaves.push(this.unpaidLeaves);
    this.allLeaves.push(this.exceptionnalLeaves);
    this.leaveService.emitLeaveData(this.allLeaves);
    /*console.log(this.annualLeaves)
    console.log(this.rttLeaves)
    console.log(this.unpaidLeaves)
    console.log(this.sickenessLeaves)
    console.log(this.allLeaves)*/
    this.countTotalLeaves();

  }

  removeLeave(stype:string, index: number){
    switch (stype) {
      case 'Annual':
        this.annualLeaves.splice(index,1);
        this.allLeaves.push(this.annualLeaves);
        break;
      case 'RTT':
        this.rttLeaves.splice(index,1);
        this.allLeaves.push(this.rttLeaves);
        break;
      case 'Sickness':
        this.sickenessLeaves.splice(index,1);
        this.allLeaves.push(this.sickenessLeaves);
        break;
      case 'Unpaid':
        this.unpaidLeaves.splice(index,1);
        this.allLeaves.push(this.unpaidLeaves);
        break;
      case 'Exceptional':
        this.exceptionnalLeaves.splice(index,1);
        this.allLeaves.push(this.exceptionnalLeaves);
        break;
      default:
        break;
    }
    this.leaveService.emitLeaveData(this.allLeaves);
    this.countTotalLeaves();
  }

  countTotalLeaves(){
    //this.leaveService.emitLeaveData(this.annualLeaves);
    this.nbAnnualLeaves =0;
    this.annualLeaves.forEach(element => {
      this.nbAnnualLeaves = this.nbAnnualLeaves + element.nbDay ;
    });

    this.nbRttLeaves =0;
    this.rttLeaves.forEach(element => {
      this.nbRttLeaves = this.nbRttLeaves + element.nbDay ;
    });

    this.nbSicknessLeaves =0;
    this.sickenessLeaves.forEach(element => {
      this.nbSicknessLeaves = this.nbSicknessLeaves + element.nbDay ;
    });
    this.nbUnpaidLeaves =0;
    this.unpaidLeaves.forEach(element => {
      this.nbUnpaidLeaves = this.nbUnpaidLeaves + element.nbDay ;
    });
    this.nbExceptionnalLeaves =0;
    this.exceptionnalLeaves.forEach(element => {
      this.nbExceptionnalLeaves = this.nbExceptionnalLeaves + element.nbDay ;
    });

  }

}
