import { User } from '../components/User';

export class VersionEntry {
  private timeStamp: Date;
  private user: User;
  private expression: string;

  public constructor(expression: string, user: User) {
    this.timeStamp = new Date();
    this.expression = expression;
    this.user = user;
  }

  public display(): string {
    return 'At:' + this.timeStamp.toLocaleDateString() + '\n' + 
    this.expression + '\n' + 'By:' + this.user.getName + '\n';
  }
}
