import {PressHerePipe} from './press-here/press-here.pipe';
import {NgModule} from '@angular/core';

@NgModule({
    imports: [
        // dep modules
    ],
    declarations: [
        PressHerePipe
    ],
    exports: [
        PressHerePipe
    ]
})
export class PipeBucketModule {
}
