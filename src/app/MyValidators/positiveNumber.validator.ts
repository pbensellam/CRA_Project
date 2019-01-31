import { AbstractControl } from '@angular/forms';

export function ValidatePositiveNumber(control: AbstractControl ) {
    if (control.value >= 0) {
        return { validPositiveNumber: true };
    }
    console.log(control.value + ' number is not valid to save CRA from');
    return null;
}
