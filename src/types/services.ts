import type { JwtPayload } from "@/services/jwt/jwtServices";

/**
 * Hashing service (abstraction)
 * of functions that we are going to use to encrypt passwords
 * to not directly expose the functions we use from bcrypt or another library
 */
export interface PasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
 
export interface RefreshTokenService {
  generate(payload: JwtPayload): Promise<string>;
  validate(token: string): Promise<JwtPayload | null>;
  rotate(oldToken: string): Promise<string>;
  revoke(token: string): void;
}
