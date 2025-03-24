export class ErrorMessage extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorMessage";
  }
}
