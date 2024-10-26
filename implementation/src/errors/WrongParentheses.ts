import { IError } from "../interfaces/IError";

export class WrongParentheses implements IError {
    
    public evaluate() {
        throw new Error("Method not implemented.");
    }
    
    public display(): string {
        return "Invalid use of parentheses";
    }
    
}