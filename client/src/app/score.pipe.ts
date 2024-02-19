import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'score'
})
export class ScorePipe implements PipeTransform {

  transform(value: any, args?: any): any {

    const number = +value;
    value = number >= 10 ? number : number.toFixed(1);

    return value;
  }
}
