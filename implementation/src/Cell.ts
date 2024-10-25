import { IExpression } from "./interfaces/IExpression";
import { VersionHistory } from "./version/VersionHistory";
import { EmptyExpression } from "./expressions/EmptyExpression";

export class Cell {
    private address: string;
    private expression: IExpression;
    private versionHistory: VersionHistory;

    public constructor(address: string) {
        this.address = address;
        this.expression = new EmptyExpression();
    }
}