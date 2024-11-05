import { AError } from "../errors/AError";

export class WrongParentheses extends AError {
    
    public display(): string {
        return "Invalid use of parentheses";
    }
}