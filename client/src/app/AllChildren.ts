import { Child } from './Child';


export interface AllChildren {
    kid: Child;
    next: AllChildren[];
}
