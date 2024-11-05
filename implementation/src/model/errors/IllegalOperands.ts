import { AError } from "../errors/AError";

export class IllegalOperands extends AError {
    
    public display(): string {
        return 'Illegal operands';
    }
}