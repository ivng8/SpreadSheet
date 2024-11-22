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

  public getId(): string {
    return this.id;
  }

  public getParent(): string | null {
    return this.parent;
  }

  public getEntry(): string {
    return this.expression;
  }

  public display(): string {
    return 'At:' + this.timeStamp.toLocaleDateString() + '\n' + 
    this.expression + '\n' + 'By:' + this.user.getName + '\n';
  }
}
