import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { z } from "zod";
import { ENV } from "@/lib/config/envValidator";
import { logger } from "@/lib/logger";
import { toErrorMessage } from "@/errors/index";
import { handleJWTError, handleJWTGenerationError } from "./errorHandler";

export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["Employee", "Manager", "admin"]),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

const JWT_SECRET = new TextEncoder().encode(ENV.JWT_SECRET);

export async function generateToken(payload: JwtPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ENV.JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    logger.debug("JWT generated", {
      userId: payload.userId,
      expiresIn: ENV.JWT_EXPIRES_IN,
      tokenLength: token.length,
    });

    return token;
  } catch (error: unknown) {
    throw handleJWTGenerationError(error, payload.userId);
  }
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const validatedPayload = JwtPayloadSchema.parse(payload);

    logger.debug("JWT verified", {
      userId: validatedPayload.userId,
      tokenLength: token.length,
    });

    return validatedPayload;
  } catch (error: unknown) {
    throw handleJWTError(error, token.length);
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = decodeJwt(token);
    const payload = JwtPayloadSchema.parse(decoded);

    logger.debug("JWT decoded", {
      userId: payload.userId,
      tokenLength: token.length,
    });

    return payload;
  } catch (error: unknown) {
    logger.warn("JWT decode failed", {
      error: toErrorMessage(error),
      tokenLength: token.length,
    });
    return null;
  }
}