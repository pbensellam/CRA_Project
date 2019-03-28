import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';

export function ValidatePositiveNumber():ValidatorFn {
    
    return (control: AbstractControl): {[key: string]: any} | null => {
        const forbidden = control.value;
        if (control.value>1){
            return control.value ? {'forbiddenName': {value: control.value}} : null;
        }
      };
/*
    if (num.value >= 0) {
        return { control : AbstractControl};
    }
    console.log(num + ' number is not valid to save CRA from');
    return null;*/
}
