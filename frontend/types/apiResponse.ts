// The result of an api call, either a success with data or a failure with an error message
// The "data"-type can be extended by defining ApiResponse<DATATYPE>
export type ApiResponse<T = string> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export type AbilityResponse = {
  message: string;
  diceRoll: string;
};
