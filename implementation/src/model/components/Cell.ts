import { IExpression } from '../interfaces/IExpression';
import { VersionHistory } from "model/version/VersionHistory";
import { Director } from '../Director';
import { SpreadSheet } from './SpreadSheet';
import { IError } from '../interfaces/IError';
import { User } from './User';
import { AError } from 'model/errors/AError';

// Simple types for our observers
type CellObserver = (cell: Cell) => void;
type ValueChangeCallback = (expression: IExpression) => void;

/**
 * represents a cell in a spreadsheet
 */
export class Cell {
  private input: string;
  private expression: IExpression;
  private versionHistory: VersionHistory;
  private sheet: SpreadSheet;

  // Observer pattern implementation
  private observers: Set<CellObserver> = new Set();
  private valueChangeObservers: Set<ValueChangeCallback> = new Set();
  private dependencies: Set<Cell> = new Set();
  private dependents: Set<Cell> = new Set();

  /**
   * constructor of a cell
   * @param input the raw user input in the cell
   * @param reference the spreadsheet the cell is contained in
   */
  public constructor(input: string, reference: SpreadSheet) {
    this.input = input;
    this.sheet = reference;
    this.versionHistory = new VersionHistory();
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
  }

  /**
   * Subscribe to cell changes
   * @param observer The observer function to be called on changes
   */
  public subscribe(observer: CellObserver): void {
    this.observers.add(observer);
  }

  /**
   * Unsubscribe from cell changes
   * @param observer The observer function to remove
   */
  public unsubscribe(observer: CellObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Subscribe to value changes specifically
   * @param callback The callback function to be called when value changes
   */
  public subscribeToValue(callback: ValueChangeCallback): void {
    this.valueChangeObservers.add(callback);
  }

  /**
   * Unsubscribe from value changes
   * @param callback The callback function to remove
   */
  public unsubscribeFromValue(callback: ValueChangeCallback): void {
    this.valueChangeObservers.delete(callback);
  }

  /**
   * Add a cell that this cell depends on
   * @param cell The cell this cell depends on
   */
  public addDependency(cell: Cell): void {
    this.dependencies.add(cell);
    cell.addDependent(this);
  }

  /**
   * Remove a dependency
   * @param cell The cell to remove from dependencies
   */
  public removeDependency(cell: Cell): void {
    this.dependencies.delete(cell);
    cell.removeDependent(this);
  }

  /**
   * Add a cell that depends on this cell
   * @param cell The cell that depends on this cell
   */
  private addDependent(cell: Cell): void {
    this.dependents.add(cell);
  }

  /**
   * Remove a dependent
   * @param cell The cell to remove from dependents
   */
  private removeDependent(cell: Cell): void {
    this.dependents.delete(cell);
  }

  /**
   * Clear all dependencies
   */
  private clearDependencies(): void {
    this.dependencies.forEach(cell => {
      cell.removeDependent(this);
    });
    this.dependencies.clear();
  }

  /**
   * Notify all observers of changes
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this));
  }

  /**
   * Notify value change observers
   * @param expression The new expression
   */
  private notifyValueObservers(expression: IExpression): void {
    this.valueChangeObservers.forEach(observer => observer(expression));
  }

  /**
   * Update dependent cells
   */
  private updateDependents(): void {
    this.dependents.forEach(cell => {
      cell.getValue();
      cell.notifyObservers();
      cell.notifyValueObservers(cell.expression);
      cell.updateDependents();
    });
  }

  /**
   * gets the raw input that is in the cell
   * @returns a string that is the input
   */
  public getInput(): string {
    return this.input;
  }

  /**
   * updates the input from the user in the cell
   * thus affecting the expression and the versioning of the cell
   * @param newText the new input
   */
  public updateContents(newText: string, user: User): void {
    if (this.input === newText) {
      return;
    }
    const oldValue = this.getValue();
    this.clearDependencies();

    this.input = newText;
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
    this.versionHistory.addEntry(newText, user);

    // If the value has changed, notify observers
    const newValue = this.getValue();
    if (oldValue !== newValue) {
      this.notifyValueObservers(this.expression.evaluate());
    }

    // Notify general observers
    this.notifyObservers();

    // Update dependent cells
    this.updateDependents();
  }

  public revert(entryId: string) {
    this.versionHistory.revert(entryId);
  }

  /**
   * updates the expression of the cell to be an error upon
   * finding errors when calculating the expression
   * @param error the type of error
   */
  public catchErrors(error: IError): void {
    this.expression = error;
    this.notifyObservers();
    this.notifyValueObservers(this.expression);
  }

  /**
   * returns the value of the expression inside of the cell
   * @returns a string or number or null in case of errors
   */
  public getValue(): any {
    const value = this.expression.evaluate();
    return value;
  }

  /**
   * Get all cells that this cell depends on
   * @returns Set of dependent cells
   */
  public getDependencies(): Set<Cell> {
    return new Set(this.dependencies);
  }

  public hasError(): boolean {
    return this.expression instanceof AError;
  }
}