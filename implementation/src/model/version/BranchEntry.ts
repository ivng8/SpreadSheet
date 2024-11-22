import { VersionEntry } from './VersionEntry';

/**
 * represents a branch in the editing history similar to git
 * holds a list of entries
 * also has the parent which has an index and id
 */
export interface BranchEntry {
  entries: VersionEntry[];
  parent: {
    index: number;
    entryId: string;
  } | null;
}
