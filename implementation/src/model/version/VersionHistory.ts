import { User } from 'model/components/User';
import { VersionEntry } from './VersionEntry';

export class VersionHistory {
  private entries: VersionEntry[] = [];

  public addEntry(entry: string, user: User): void {
    this.entries.push(new VersionEntry(entry, user));
  }

  public getHistory(): VersionEntry[] {
    return this.entries;
  }
}
