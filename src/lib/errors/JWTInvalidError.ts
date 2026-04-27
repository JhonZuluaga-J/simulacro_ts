import { JWTError } from "./JWTError";

export class JWTInvalidError extends JWTError {
  constructor(tokenLength?: number, userId?: string) {
    super({
      code: "JWT_INVALID",
      message: "Invalid token",
      statusCode: 401,
      context: { tokenLength, userId },
    });
    this.name = "JWTInvalidError";
  }
}