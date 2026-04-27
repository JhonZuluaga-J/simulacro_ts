import bcrypt from "bcrypt";
import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ENV } from "@/lib/config/envValidator";
import { toErrorMessage } from "@/lib/errors";
import type { PasswordService } from "@/types/services";

const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{31,53}$/;

let cachedSaltRounds: number | null = null;

function getSaltRounds(): number {
  if (cachedSaltRounds === null) cachedSaltRounds = ENV.SALT_ROUNDS;
  return cachedSaltRounds;
}

function validatePassword(password: string): void {
  if (typeof password !== "string") throw new ValidationError("Password must be a string");

  const trimmed = password.trim();

  if (trimmed.length < 8) throw new ValidationError("Password must be at least 8 characters");
  if (!/[0-9]/.test(trimmed)) throw new ValidationError("Password must include at least one number");
  if (!/[A-Z]/.test(trimmed)) throw new ValidationError("Password must include at least one uppercase letter");
  if (!/[a-z]/.test(trimmed)) throw new ValidationError("Password must include at least one lowercase letter");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) throw new ValidationError("Password must include at least one special character");
}

function validateHash(hash: string): void {
  if (typeof hash !== "string" || hash.length === 0) throw new ValidationError("Hash must be a valid string");
  if (!BCRYPT_REGEX.test(hash)) throw new ValidationError("Invalid bcrypt hash format");
}

async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  try {
    const rounds = getSaltRounds();
    const hash = await bcrypt.hash(password, rounds);
    logger.debug("Password hashed", { rounds, hashLength: hash.length });
    return hash;
  } catch (error: unknown) {
    logger.error("Password hashing failed", { error: toErrorMessage(error) });
    throw new ValidationError("Failed to hash password", { cause: toErrorMessage(error) });
  }
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  validatePassword(password);
  validateHash(hash);
  try {
    const result = await bcrypt.compare(password, hash);
    logger.debug("Password comparison", { result, hashLength: hash.length });
    return result;
  } catch (error: unknown) {
    logger.error("Password comparison failed", { error: toErrorMessage(error) });
    throw new ValidationError("Failed to compare password", { cause: toErrorMessage(error) });
  }
}

export const bcryptPasswordService: PasswordService = {
  hash: hashPassword,
  compare: comparePassword,
};