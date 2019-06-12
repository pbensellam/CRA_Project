export class Overtime{

    private _day: Date; // date du jour
    private _value: number; // nombre de d'heure supplémentaire 
    private _type: string; // 5 type d'heure supp possible 

    constructor(){}

    public get type(): string {
        return this._type;
    }
    public set type(value: string) {
        this._type = value;
    }
    public get day(): Date {
        return this._day;
    }
    public set day(value: Date) {
        this._day = value;
    }
    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this._value = value;
    }
    


}