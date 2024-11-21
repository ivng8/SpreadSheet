import { User } from 'model/components/User';
import { VersionEntry } from './VersionEntry';
import { BranchEntry } from './BranchEntry';

export class VersionHistory {
  private branches: BranchEntry[];
  private lastRevertEntry: string | null = null;

  public constructor() {
    this.branches = [{
        entries: [],
        parent: null
    }];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  public addEntry(entry: string, user: User): void {
    const newEntry = new VersionEntry(entry, user, this.generateId(), this.getLastNodeId());
    if (this.lastRevertEntry) {
      this.branches.push({
        entries: [newEntry],
          parent: {
              index: this.findSplitOff(this.lastRevertEntry).index,
              entryId: this.lastRevertEntry
          }
      });
      this.lastRevertEntry = null;
      this.tryMerge();
    } else {
      this.branches[this.branches.length - 1].entries.push(newEntry);
    }
  }

  public revert(entryId: string) {
    this.lastRevertEntry = entryId;
  }

  private tryMerge() {
    const lastBranch = this.branches[this.branches.length - 1];
    const lastContent = lastBranch.entries[lastBranch.entries.length - 1].getEntry();

    for (let i = 0; i < this.branches.length - 1; i += 1) {
        const branch = this.branches[i];
        const branchHead = branch.entries[branch.entries.length - 1];

        if (branchHead.getEntry() === lastContent) {
            this.branches.pop();
            break;
        }
    }
  }

  private findSplitOff(entryId: string): { index: number; nodeIndex: number } {
    for (let i = 0; i < this.branches.length; i += 1) {
        const nodeIndex = this.branches[i].entries.findIndex(entry => entry.getId() === entryId);
        if (nodeIndex !== -1) {
            return { index: i, nodeIndex };
        }
    }
    throw new Error('Node not found');
  }

  private getLastNodeId(): string | null {
    const lastBranch = this.branches[this.branches.length - 1];
    const lastNode = lastBranch.entries[lastBranch.entries.length - 1];
    return lastNode?.getId() ?? null;
  }

  public getHistory(): BranchEntry[] {
    return this.branches;
  }
}
