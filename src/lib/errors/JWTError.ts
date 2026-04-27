import { AppError, ErrorDetails } from "./AppError";

export interface JWTErrorDetails extends ErrorDetails {
  context?: {
    tokenLength?: number;
    userId?: string;
  };
}

export class JWTError extends AppError {
  public readonly tokenLength?: number;
  public readonly userId?: string;
  
  constructor(details: JWTErrorDetails){
    super(details);
    this.name = "JWTError";
    this.tokenLength = details.context?.tokenLength;
    this.userId = details.context?.userId;
  }
}
