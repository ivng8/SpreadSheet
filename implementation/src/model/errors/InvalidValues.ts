import { IError } from "../interfaces/IError";

export class InvalidValues implements IError {
    
    public evaluate(): any {
        return null;
    }

    public display(): string {
        return 'Mixed values';
    }
    
}