export type DragonflyErrorCode =
  | "NOT_AUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "VERSION_CONFLICT";

export class DragonflyApiError extends Error {
  status: number;
  code: DragonflyErrorCode;

  constructor(params: {
    status: number;
    code: DragonflyErrorCode;
    message: string;
  }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
    this.name = "DragonflyApiError";
  }
}
