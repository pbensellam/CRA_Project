export class RhSetting{

        currentMonth: string;
        emailRH: string;
        nbBusinessDayJan:number;
        nbBusinessDayFeb:number;
        nbBusinessDayMar:number;
        nbBusinessDayApr:number;
        nbBusinessDayMay:number;
        nbBusinessDayJun:number;
        nbBusinessDayJul:number;
        nbBusinessDayAug:number;
        nbBusinessDaySep:number;
        nbBusinessDayOct:number;
        nbBusinessDayNov:number;
        nbBusinessDayDec:number;

    constructor(
        currentMonth: string,
        emailRH: string,
        nbBusinessDayJan:number,
        nbBusinessDayFeb:number,
        nbBusinessDayMar:number,
        nbBusinessDayApr:number,
        nbBusinessDayMay:number,
        nbBusinessDayJun:number,
        nbBusinessDayJul:number,
        nbBusinessDayAug:number,
        nbBusinessDaySep:number,
        nbBusinessDayOct:number,
        nbBusinessDayNov:number,
        nbBusinessDayDec:number,
    ){
        this.emailRH = emailRH;
        this.currentMonth = currentMonth;
        this.nbBusinessDayJan = nbBusinessDayJan;
        this.nbBusinessDayFeb = nbBusinessDayFeb;
        this.nbBusinessDayMar = nbBusinessDayMar;
        this.nbBusinessDayApr = nbBusinessDayApr;
        this.nbBusinessDayMay = nbBusinessDayMay;
        this.nbBusinessDayJun = nbBusinessDayJun;
        this.nbBusinessDayJul = nbBusinessDayJul;
        this.nbBusinessDayAug = nbBusinessDayAug;
        this.nbBusinessDaySep = nbBusinessDaySep;
        this.nbBusinessDayOct = nbBusinessDayOct;
        this.nbBusinessDayNov = nbBusinessDayNov;
        this.nbBusinessDayDec = nbBusinessDayDec;
        const mMap = new Map();
    }


}