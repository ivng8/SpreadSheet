export interface IBuilder {
    
    getProduct(): any;

    reset(): void;

    setContext(text: string): void;
}