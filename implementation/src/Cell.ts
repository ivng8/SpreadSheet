import { IExpression } from "./interfaces/IExpression";
import { VersionHistory } from "./version/VersionHistory";
import { EmptyExpression } from "./expressions/EmptyExpression";
import { Director } from "./Director";

export class Cell {
    private address: string;
    private input: string;
    private expression: IExpression;
    private versionHistory: VersionHistory;

    public constructor(address: string, input: string) {
        this.address = address;
        this.input = input;
        this.expression = new EmptyExpression();
    }

    public getAddress(): string {
        return this.address;
    }

    public getInput(): string {
        return this.input;
    }

    public updateContents(newText: string): void {
        this.input = newText;
        this.expression = new Director().makeExpression(this.input);
    }

    public getValue(): any {
        return this.expression.evaluate();
    }
}