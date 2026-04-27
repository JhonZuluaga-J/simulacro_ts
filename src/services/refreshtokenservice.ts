import { SignJWT, jwtVerify } from "jose";
import { ENV } from "@/lib/config/envValidator";
import { logger } from "@/lib/logger";
import { toErrorMessage, ValidationError } from "@/lib/errors";
import type { JwtPayload } from "@/services/jwt/jwtServices";
import type { RefreshTokenService } from "@/types/services";

const REFRESH_SECRET = new TextEncoder().encode(ENV.REFRESH_TOKEN_SECRET);

async function generateRefreshToken(payload: JwtPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ENV.REFRESH_TOKEN_EXPIRY)
      .sign(REFRESH_SECRET);

    logger.debug("Refresh token generated", {
      userId: payload.userId,
      expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
    });

    return token;
  } catch (error: unknown) {
    logger.error("Refresh token generation failed", { error: toErrorMessage(error), userId: payload.userId });
    throw new ValidationError("Failed to generate refresh token");
  }
}

async function validateRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    const { userId, email, role } = payload as JwtPayload;

    logger.debug("Refresh token validated", { userId });
    return { userId, email, role };
  } catch (error: unknown) {
    logger.warn("Refresh token validation failed", { error: toErrorMessage(error) });
    return null;
  }
}

async function rotateRefreshToken(oldToken: string): Promise<string> {
  const payload = await validateRefreshToken(oldToken);

  if (!payload) {
    logger.warn("Refresh token rotation failed - invalid token");
    throw new ValidationError("Invalid refresh token for rotation");
  }

  const newToken = await generateRefreshToken(payload);
  logger.info("Refresh token rotated", { userId: payload.userId });
  return newToken;
}

function revokeRefreshToken(token: string): void {
  logger.info("Refresh token revoked", { tokenLength: token.length });
}

export const refreshTokenService: RefreshTokenService = {
  generate: generateRefreshToken,
  validate: validateRefreshToken,
  rotate: rotateRefreshToken,
  revoke: revokeRefreshToken,
};
