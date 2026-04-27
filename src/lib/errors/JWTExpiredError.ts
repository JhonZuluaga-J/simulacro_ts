import { JWTError } from "./JWTError";

export class JWTExpiredError extends JWTError {
  constructor(tokenLength?: number, userId?: string) {
    super({
      code: "JWT_EXPIRED",
      message: "Token expired",
      statusCode: 401,
      context: { tokenLength, userId },
    });
    this.name = "JWTExpiredError";
  }
}