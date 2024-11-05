import { IError } from "../interfaces/IError";

export class WrongParentheses implements IError {
    
    public evaluate(): any {
        return null;
    }
    
    public display(): string {
        return "Invalid use of parentheses";
    }
    
}