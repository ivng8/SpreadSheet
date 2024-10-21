export interface IBuilder {
    create(): any;

    reset(): void;

    setContext(text: string): void;
}