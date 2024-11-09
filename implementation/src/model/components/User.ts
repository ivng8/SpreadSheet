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
}
