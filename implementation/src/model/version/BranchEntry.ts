import { VersionEntry } from "./VersionEntry";

export interface BranchEntry {
    entries: VersionEntry[];
    parent: {
        index: number;
        entryId: string;
    } | null
}