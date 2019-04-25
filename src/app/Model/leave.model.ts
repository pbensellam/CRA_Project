export class Leave{

    /** represente la notion de congés: 
     * param: date de début, date de fin , nombre de jours pris, type de congé */

    private _dateBegin: Date;
    
    private _dateEnd: Date;
    
    private _nbDay: number=0;
    
    private _leaveType: string;
    
    private _comment: string;
    

    constructor(){

    }
    
    public get dateBegin(): Date {
        return this._dateBegin;
    }
    public set dateBegin(value: Date) {
        this._dateBegin = value;
    }

    public get dateEnd(): Date {
        return this._dateEnd;
    }
    public set dateEnd(value: Date) {
        this._dateEnd = value;
    }
    public get nbDay(): number {
        return this._nbDay;
    }
    public set nbDay(value: number) {
        this._nbDay = value;
    }
    public get leaveType(): string {
        return this._leaveType;
    }
    public set leaveType(value: string) {
        this._leaveType = value;
    }

    public get comment(): string {
        return this._comment;
    }
    public set comment(value: string) {
        this._comment = value;
    }
    /**
     * ToString Methode d'un congé:
     * X jours pris entre le &datedébut et &datefin 
     */
    public leaveToString():string {
        return `${this._nbDay} jour(s) pris entre le ${this._dateBegin.toString} et ${this._dateEnd.toString}`;
    }
    

}