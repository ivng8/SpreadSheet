import { IError } from "../interfaces/IError";

export class InvalidExpression implements IError {

    evaluate() {
        throw new Error("Method not implemented.");
    }
    
    display(): string {
        throw new Error("Method not implemented.");
    }
    
}