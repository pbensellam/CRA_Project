import { WeekDay } from '@angular/common';
import { Overtime } from './overtime.model';
import { Leave } from './leave.model';

// tslint:disable-next-line:class-name
export class CRA {

    pdfFileUrl: string;
    csvFileUrl: string;
    nbWorkDay: number;

    constructor(
        public month: string,
        public name: string,
        public responsibleName: string,
        public responsibleEmail : string,
        public email: string,
        public details: string,
        public annualLeaves: Leave[],
        public sicknessLeaves: Leave[],
        public rttLeaves: Leave[],
        public unpaidLeaves: Leave[],
        public nbAnnualLeave: number,
        public nbUnPaidLeave: number,
        public nbSicknessLeave: number,
        public nbRTT: number,
        public m_overTime: Overtime,
        public craComment: string,
        
    ) {}

}
