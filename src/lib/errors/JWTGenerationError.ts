import { JWTError } from "./JWTError";

export class JWTGenerationError extends JWTError {
  constructor(tokenLength?: number, userId?: string) {
    super({
      code: "JWT_GENERATION_FAILED",
      message: "Failed to generate token",
      statusCode: 500,
      context: { tokenLength, userId },
    });
    this.name = "JWTGenerationError";
  }
}