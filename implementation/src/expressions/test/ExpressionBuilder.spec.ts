import { IExpression } from "../../interfaces/IExpression";

describe('ExpressionBuilder', (): void =>{
    let expression : IExpression;

    it('example test should pass', (): void => {
        const value = 1 + 1;
        expect(value).toBe(2);
    });
});