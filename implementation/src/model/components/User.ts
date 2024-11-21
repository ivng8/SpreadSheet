/**
 * represents a User participating in the spreadsheet
 */
export class User {
    private name: string;
    private email: string;

    /**
     * constructor of a user
     * @param name the name
     * @param email the email which serves as the unique identifier 
     */
    public constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

    /**
     * returns the name of the user
     * @returns a string of the name
     */
    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }
}
