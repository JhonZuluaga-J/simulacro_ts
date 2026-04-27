import { JWTError } from "./JWTError";

export class JWTPayloadInvalidError extends JWTError {
  constructor(tokenLength?: number, userId?: string) {
    super({
      code: "JWT_PAYLOAD_INVALID",
      message: "Token payload is invalid",
      statusCode: 401,
      context: { tokenLength, userId },
    });
    this.name = "JWTPayloadInvalidError";
  }
}