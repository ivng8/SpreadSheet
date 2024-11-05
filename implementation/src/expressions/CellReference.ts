import { IExpression } from "../interfaces/IExpression";
import { SpreadSheet } from "../SpreadSheet";

export class CellReference implements IExpression {
    private reference : string;
    private sheet : SpreadSheet;

    constructor(reference: string, sheet: SpreadSheet) {
        this.reference = reference;
        this.sheet = sheet;
    }

    public evaluate(): number | string {
        return this.sheet.getCell(this.reference).getValue();
    }

    public display(): string {
        return this.evaluate + '';
    }
}
