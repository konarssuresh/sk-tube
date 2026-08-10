export const AppErrorCode = {
  VALIDATION: "VALIDATION",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE: "DUPLICATE",
  UPSTREAM: "UPSTREAM",
};

const STATUS_BY_CODE = {
  [AppErrorCode.VALIDATION]: 400,
  [AppErrorCode.UNAUTHORIZED]: 401,
  [AppErrorCode.NOT_FOUND]: 404,
  [AppErrorCode.DUPLICATE]: 409,
  [AppErrorCode.UPSTREAM]: 502,
};

export class AppError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = options.status ?? STATUS_BY_CODE[code] ?? 500;
    this.details = options.details;
  }
}

export function fromZodError(error, message = "Invalid input.") {
  const details = error.issues?.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return new AppError(AppErrorCode.VALIDATION, message, { details });
}

export function isMongoDuplicateKeyError(error) {
  return error?.name === "MongoServerError" && error?.code === 11000;
}

export function duplicateKeyAppError(message = "This record already exists.") {
  return new AppError(AppErrorCode.DUPLICATE, message);
}
