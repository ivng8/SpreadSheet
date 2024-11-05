import { IError } from "../interfaces/IError";

export class NullOperand implements IError {

    public evaluate(): any {
        return null;
    }

    public display(): string {
        return 'Missing operand';
    }
    
}