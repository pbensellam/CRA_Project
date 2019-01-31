import { WeekDay } from '@angular/common';

// tslint:disable-next-line:class-name
export class CRA {
    constructor(
        public month: string,
        public name: string,
        public responsibleName: string,
        public email: string,
        public details: string,
        public nbAnnualLeave: number,
        public nbUnPaidLeave: number,
        public nbSicknessLeave: number,
        public nbRTT: number,
        public dateEndAnnualLeave: Date ,
        public dateBeginAnnualLeave: Date,
        public dateBeginSicknessLeave: Date,
        public dateEndSicknessLeave: Date,
        public dateBeginUnpaidLeave: Date,
        public dateEndUnpaidLeave: Date,
        public dateBeginRTT: Date,
        public dateEndRTT: Date,
        public overtimeW1: number,
        public overtimeW2: number,
        public overtimeW3: number,
        public overtimeW4: number,
        public overtimeW5: number,
        public craComment: string,
        public nbWorkDay: number
    ) {}
}
