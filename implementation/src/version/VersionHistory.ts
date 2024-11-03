import { VersionEntry } from "./VersionEntry";

export class VersionHistory {
    private entries: VersionEntry[] = [];

    public addEntry(entry: VersionEntry): void {
        this.entries.push(entry);
    }

    public getHistory(): VersionEntry[] {
        return this.entries;
    }
}