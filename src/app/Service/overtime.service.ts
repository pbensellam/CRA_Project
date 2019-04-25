import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Overtime } from '../Model/overtime.model';

@Injectable({
    providedIn: 'root'
  })

export class OvertimeService {

    otSubject = new Subject<Overtime[]>();

  //private overtimeDataSubject = new BehaviorSubject([]);
  //currentOvertimeData = this.overtimeDataSubject.asObservable();

  constructor() { }

  emitOvertimeData(newOvertimeData: Overtime[]) {
    /* recupere l'object allCra et l'emet a travers le subject craSubjet */
    this.otSubject.next(newOvertimeData);
  }
  /*
  changeOvertimeData(newOvertimeData: Leave[]) {
    this.overtimeDataSubject.next(newOvertimeData);
  }
  */

}