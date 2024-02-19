import { Child } from './Child';


export interface Generations {
    kid: Child;
    next: Generations[];
}
