import { IExpression } from '../interfaces/IExpression';
import { Operator } from '../enums/Operator';
import { Cell } from 'model/components/Cell';
import { MixedValues } from 'model/errors/MixedValues';
import { IllegalOperands } from 'model/errors/IllegalOperands';

/**
 * represents a formula expression which is two operands and an operator
 */
export class FormulaExpression implements IExpression {
  private operator: Operator;
  private left: IExpression;
  private right: IExpression;
  private cell: Cell;

  /**
   * constructor of a FormulaExpression
   * @param operator the operator
   * @param left the left operand
   * @param right the right operand
   * @param cell the cell it belongs to
   */
  public constructor(operator: Operator, left: IExpression, right: IExpression, cell: Cell) {
    this.operator = operator;
    this.left = left;
    this.right = right;
    this.cell = cell;
  }

  public evaluate(): unknown {
    if (typeof this.left.evaluate() !== typeof this.right.evaluate()) {
      this.cell.catchErrors(new MixedValues());
    }
    let math: boolean = this.checkBothNumbers();
    switch (this.operator) {
      case Operator.DIV:
        if (!math) {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        } else {
          return this.left.evaluate() / this.right.evaluate();
        }
      case Operator.MINUS:
        if (!math) {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        } else {
          return this.left.evaluate() - this.right.evaluate();
        }
      case Operator.PLUS:
        return this.left.evaluate() + this.right.evaluate();
      case Operator.MULT:
        if (!math) {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        } else {
          return this.left.evaluate() * this.right.evaluate();
        }
      case Operator.POWER:
        if (!math) {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        } else {
          return this.left.evaluate() ** this.right.evaluate();
        }
      default:
        break;
    }
  }

  /**
   * checks that both operands are arithmetic
   * @returns boolean
   */
  private checkBothNumbers(): boolean {
    return typeof this.left.evaluate() === 'number' && typeof this.right.evaluate() === 'number';
  }
}
