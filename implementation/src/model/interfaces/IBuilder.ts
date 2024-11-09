/**
 * interface for a general build pattern
 */
export interface IBuilder {

  /**
   * returns the constructed instance of whatever the implemented class is making
   */
  getProduct(): any;

  /**
   * resets the implemented class' information of the object it is creating
   */
  reset(): void;

  /**
   * provides information to the builder of what the object should be like
   * @param text is the said information
   */
  setContext(text: string[]): void;
}
