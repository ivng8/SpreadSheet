import { User } from '../components/User';

export class VersionEntry {
  private timeStamp: Date;
  private user: User;
  private expression: string;
  private id: string;
  private parent: string | null;

  public constructor(expression: string, user: User, id: string, parent: string | null) {
    this.timeStamp = new Date();
    this.expression = expression;
    this.user = user;
    this.id = id;
    this.parent = parent;
  }

  /**
   * gets the id of the entry
   * @returns the string representing the id
   */
  public getId(): string {
    return this.id;
  }

  /**
   * returns the string that represents the parent
   * @returns string or null if it has no parent
   */
  public getParent(): string | null {
    return this.parent;
  }

  /**
   * returns the input of the entry
   * @returns 
   */
  public getEntry(): string {
    return this.expression;
  }

  /**
   * displays the entry for the user to read
   * @returns a string that says At: time Input: string By: Username
   */
  public display(): string {
    return 'At:' + this.timeStamp.toLocaleDateString() + '\n' + 
    this.expression + '\n' + 'By:' + this.user.getName + '\n';
  }
}
