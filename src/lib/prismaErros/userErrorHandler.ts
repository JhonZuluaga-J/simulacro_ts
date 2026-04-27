import { NotFoundError, ValidationError, toErrorMessage } from "@/errors/index";
import { logger } from "@/lib/logger";

type PrismaErrorCode = "P2025" | "P2002";

interface PrismaError {
  code: PrismaErrorCode;
}

const isPrismaError = (err: unknown): err is PrismaError =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  typeof (err as { code: unknown }).code === "string";

function handleNotFound(identifier: string): never {
  logger.warn("Resource not found", { entity: "User", identifier });
  throw new NotFoundError("Usuario", identifier);
}

function handleDuplicate(email: string): never {
  logger.warn("Duplicate user attempted", { email });
  throw new ValidationError(`El email ${email} ya está registrado`);
}

function handleUnknown(err: unknown): never {
  logger.error("Unexpected database error", { error: toErrorMessage(err) });
  throw err;
}

const PRISMA_ERROR_HANDLERS: Record<PrismaErrorCode, (context: string) => never> = {
  P2025: handleNotFound,
  P2002: handleDuplicate,
};

async function handlePrismaError<T>(
  promise: Promise<T>,
  context: string,
  code: PrismaErrorCode
): Promise<T> {
  try {
    return await promise;
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === code) {
      PRISMA_ERROR_HANDLERS[code](context);
    }
    handleUnknown(err);
  }
}

export const handleNotFoundError = <T>(promise: Promise<T>, identifier: string): Promise<T> =>
  handlePrismaError(promise, identifier, "P2025");

export const handleDuplicateError = <T>(promise: Promise<T>, email: string): Promise<T> =>
  handlePrismaError(promise, email, "P2002");