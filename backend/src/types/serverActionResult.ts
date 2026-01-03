// The result of a server call, either a success with data or a failure with an error message
// The "data"-type can be extended by defining ServerResult<DATATYPE>
export type ServerResult<T = string> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
