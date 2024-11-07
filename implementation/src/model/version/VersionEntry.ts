import { User } from '../components/User';

export class VersionEntry {
  private timeStamp: Date;
  private user: User;
  private expression: string;

  public constructor(expression: string) {
    this.expression = expression;
  }
}
