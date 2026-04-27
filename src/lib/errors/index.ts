export { AppError, type ErrorCode, type ErrorDetails } from "./AppError";
export { DatabaseError } from "./DatabaseError";
export { ForbiddenError } from "./ForbiddenError";
export { JWTError, type JWTErrorDetails } from "./JWTError";
export { JWTExpiredError } from "./JWTExpiredError";
export { JWTGenerationError } from "./JWTGenerationError";
export { JWTInvalidError } from "./JWTInvalidError";
export { JWTPayloadInvalidError } from "./JWTPayloadInvalidError";
export { NotFoundError } from "./NotFoundError";
export { UnauthorizedError } from "./UnauthorizedError";
export { ValidationError } from "./ValidationError";

export const toErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);