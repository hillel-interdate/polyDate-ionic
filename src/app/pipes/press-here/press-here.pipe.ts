import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'pressHere'
})
export class PressHerePipe implements PipeTransform {

    transform(value: string): string {
        return value.replace('לחצו כאן', '<span class= "blue underline">לחצו כאן</span>');
    }

}
