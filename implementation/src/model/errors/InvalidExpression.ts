import { AError } from "../errors/AError";

export class InvalidExpression extends AError {
    
    public display(): string {
        return 'Invalid Expression';
    }
}