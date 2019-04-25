import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

export class LeaveService {

  private leaveDataSubject = new BehaviorSubject([]);
  currentLeaveData = this.leaveDataSubject.asObservable();

  constructor() { }
  
  emitLeaveData(newLeaveData: any[]) {
    this.leaveDataSubject.next(newLeaveData);
  }
  

}