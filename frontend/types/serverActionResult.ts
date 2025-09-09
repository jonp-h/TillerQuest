// The result of a server action, either success with data or failure with error message
// The "data"-type can be extended by defining ServerActionResult<DATATYPE>
export type ServerActionResult<T = string> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
