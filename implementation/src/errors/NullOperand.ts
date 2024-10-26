import { IError } from "../interfaces/IError";

export class NullOperand implements IError {

    public evaluate(): any {
        return null;
    }

    public display(): string {
        throw new Error("Method not implemented.");
    }
    
}