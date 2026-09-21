export class ErrorMessage extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorMessage";
  }
}

// thrown when a game must be forcefully ended (e.g. anti-cheat detection).
// carries the gameId so the caller can persist the abort after the
// in-flight transaction has rolled back.
export class GameAbortedError extends Error {
  gameId: string;
  constructor(message: string, gameId: string) {
    super(message);
    this.name = "GameAbortedError";
    this.gameId = gameId;
  }
}
