import { Overtime } from './overtime.model';
import { Leave } from './leave.model';

// tslint:disable-next-line:class-name
export class CRA {
    
    pdfFileUrl: string;
    csvFileUrl: string;
    month: string;
    name: string;
    company: string;
    responsibleName: string;
    nbWorkDay: number=0;
    responsibleEmail : string;
    email: string;
    details: string;
    leavesArray: any[]=[];
    overtimes: Overtime[]=[];
    craComment: string;
    
    constructor(
        month: string,
        name: string,
        company : string,
        responsibleName: string,
        responsibleEmail : string,
        email: string,
        details: string,
        leavesArray: any[]=[],
        overtimes: Overtime[]=[],
        craComment: string
        
    ) {
        this.responsibleName = responsibleName;
        this.month = month;
        this.name = name;
        this.responsibleEmail = responsibleEmail;
        this.email=email;
        this.details = details;
        this.leavesArray = leavesArray;
        this.overtimes = overtimes;
        this.craComment = craComment;
        this.company = company;
    }


    public countLeavebyType(strType:string):number {
        var count = 0
        this.leavesArray.forEach((arrLeave) => {
                arrLeave.forEach((leave:Leave) => {
                    if(leave.leaveType == strType){
                        count = count + leave.nbDay;
                    }
                });
        });
        return count;
    }

    public countLeaves():number {
        var count = 0
        if (this.leavesArray === null ){
            return count;
        }
        else {
            this.leavesArray.forEach(arrLeave => {
                arrLeave.forEach(leave => {
                        count = count + leave.nbDay;
                });
            });
            return count;
        }
    }

    public countOvertimebyType(strType:string):number {
        var count = 0
        if (this.overtimes === null ){
            return count;
        }
        else {
            this.overtimes.forEach((overtime:Overtime) => {
                    if(overtime.type === strType){
                        count = count + overtime.value;
                    }
                });
                return count;   
        }
    }

    public countOvertime():number {
        var count = 0
            this.overtimes.forEach(overtime => {
                console.log(overtime);
                count = count + overtime.value;         
            });
            return count;
    }



}
