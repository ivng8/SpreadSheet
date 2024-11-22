import { User } from 'model/components/User';
import { VersionEntry } from './VersionEntry';
import { BranchEntry } from './BranchEntry';

/**
 * represents a versionhistory that is specific to a cell
 */
export class VersionHistory {
  private branches: BranchEntry[];
  private lastRevertEntry: string | null = null;

  /**
   * constructor of a version history
   */
  public constructor() {
    this.branches = [
      {
        entries: [],
        parent: null,
      },
    ];
  }

  /**
   * generates a string id for version entries
   * @returns
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * adds an entry into the history, it checks if the user previously reverted history
   * if the user reverted then the new entry will branch from that point on
   * if the entry is the same as the latest entry from another branch it will combine into it
   * @param entry the input value
   * @param user the user doing it
   */
  public addEntry(entry: string, user: User): void {
    const newEntry = new VersionEntry(entry, user, this.generateId(), this.getLastNodeId());
    if (this.lastRevertEntry) {
      this.branches.push({
        entries: [newEntry],
        parent: {
          index: this.findSplitOff(this.lastRevertEntry),
          entryId: this.lastRevertEntry,
        },
      });
      this.lastRevertEntry = null;
      this.tryMerge();
    } else {
      this.branches[this.branches.length - 1].entries.push(newEntry);
    }
  }

  /**
   * adds a marker saying that the user is reverting to a certain entry
   * @param entryId the id of that entry
   */
  public revert(entryId: string) {
    this.lastRevertEntry = entryId;
  }

  /**
   * checks if the working branch can merge with any of the other branches
   */
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

  /**
   * splits off from the working branch into a new branch off a given node
   * @param entryId the entry id that is being split off
   * @returns the index of the node to split off
   */
  private findSplitOff(entryId: string): number {
    for (let i = 0; i < this.branches.length; i += 1) {
      const nodeIndex = this.branches[i].entries.findIndex(entry => entry.getId() === entryId);
      if (nodeIndex !== -1) {
        return i;
      }
    }
    throw new Error('Node not found');
  }

  /**
   * find the latest node from the branch
   * @returns the id of the latest node
   */
  private getLastNodeId(): string | null {
    const lastBranch = this.branches[this.branches.length - 1];
    const lastNode = lastBranch.entries[lastBranch.entries.length - 1];
    return lastNode?.getId() ?? null;
  }

  /**
   * gets the history of the cell
   * @returns the branches that represent the history of the cell
   */
  public getHistory(): BranchEntry[] {
    return this.branches;
  }
}
