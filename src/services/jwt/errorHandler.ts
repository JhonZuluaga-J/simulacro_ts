import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  toErrorMessage,
  JWTError,
  JWTExpiredError,
  JWTInvalidError,
  JWTPayloadInvalidError,
  JWTGenerationError,
} from "@/lib/errors";

type JoseErrorCode = "ERR_JWT_EXPIRED" | "ERR_JWT_INVALID";

type JoseErrorClassMap = { [K in JoseErrorCode]: new (tokenLength?: number) => JWTError };

const JOSE_ERROR_CLASSES: JoseErrorClassMap = {
  ERR_JWT_EXPIRED: JWTExpiredError,
  ERR_JWT_INVALID: JWTInvalidError,
};

interface JoseError {
  code: JoseErrorCode;
}

const isJoseError = (err: unknown): err is JoseError =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as { code: string }).code in JOSE_ERROR_CLASSES;

function handleJoseError(err: JoseError, tokenLength: number): JWTError {
  const jwtError = new JOSE_ERROR_CLASSES[err.code](tokenLength);
  logger.warn(`JWT ${jwtError.message.toLowerCase()}`, { tokenLength, code: err.code });
  return jwtError;
}

function handleZodError(err: z.ZodError, tokenLength: number): JWTError {
  const jwtError = new JWTPayloadInvalidError(tokenLength);
  logger.warn("JWT payload invalid", { errors: err.issues, tokenLength });
  return jwtError;
}

function handleUnknownVerifyError(err: unknown, tokenLength: number): JWTError {
  logger.error("JWT verification failed", { error: toErrorMessage(err), tokenLength });
  return new JWTInvalidError(tokenLength);
}

export function handleJWTError(error: unknown, tokenLength: number): JWTError {
  if (isJoseError(error)) return handleJoseError(error, tokenLength);
  if (error instanceof z.ZodError) return handleZodError(error, tokenLength);
  return handleUnknownVerifyError(error, tokenLength);
}

export function handleJWTGenerationError(error: unknown, userId: string): JWTError {
  const jwtError = new JWTGenerationError(undefined, userId);
  logger.error("JWT generation failed", { error: toErrorMessage(error), userId });
  return jwtError;
}
