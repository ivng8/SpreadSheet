import { IBuilder } from '../interfaces/IBuilder'

export class SpreadSheetBuilder implements IBuilder {
    getProduct() {
        throw new Error('Method not implemented.');
    }
    reset(): void {
        throw new Error('Method not implemented.');
    }
    setContext(text: string[]): void {
        throw new Error('Method not implemented.');
    }

}