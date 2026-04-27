import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { z } from "zod";
import { ENV } from "@/lib/config/envValidator";
import { logger } from "@/lib/logger";
import { handleJWTError, handleJWTGenerationError } from "./errorHandler";

// Zod schema for validation
export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(), // your ID is String UUID
  email: z.string().email(),
  role: z.enum(["admin", "manager", "employee"]),
});

// TypeScript type inferred from schema
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// Secret key as Uint8Array for jose (más seguro)
const JWT_SECRET = new TextEncoder().encode(ENV.JWT_SECRET);
//                 └── convierte "mi_secreto" → Uint8Array([109, 105, 95...])
export async function generateToken(payload: JwtPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)  // 1. Crea el JWT con el payload
      .setProtectedHeader({ alg: 'HS256'})    // 2. Define el algoritmo en el header
      .setIssuedAt()                          // 3. establece la fecha de emisión
      .setExpirationTime(ENV.JWT_EXPIRES_IN)  // 4. establece la fecha de expiración
      .sign(JWT_SECRET)                       // 5. firma el token con la clave secreta
    logger.debug(`JWT generated`, {
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
    const { payload } = await jwtVerify(token, JWT_SECRET); // valida criptográficamente
    const validatedPayload = JwtPayloadSchema.parse(payload); // valida esquema
    
    logger.debug(`JWT verified`, {
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
    logger.debug(`JWT decoded`, {
      userId: payload.userId,
      tokenLength: token.length,
    });
    return payload;
  } catch (error: unknown) {
    logger.warn(`JWT decode failed`, {
      error: error instanceof Error ? error.message : String(error),
      tokenLength: token.length,
    });
    return null;
  }
}
