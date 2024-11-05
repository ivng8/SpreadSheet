import { AError } from "../errors/AError";

export class InvalidRange extends AError {
    
    public display(): string {
        return 'Invalid Range';
    }
}