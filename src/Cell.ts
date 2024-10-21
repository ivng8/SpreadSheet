import { IExpression } from "./interfaces/IExpression";
import { VersionHistory } from "./version/VersionHistory";

export class Cell {
    private address: string;
    private inputs: string;
    private expression: IExpression;
    private versionHistory: VersionHistory;
}