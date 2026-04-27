import { findByEmail, create } from "@/repositories/userRepository";
import { bcryptPasswordService } from "./bcryptService";
import { generateToken, type JwtPayload } from "./jwt/jwtServices";
import { refreshTokenService } from "./refreshtokenservice";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { SafeUser, User, CreateUserInput, Role } from "@/types/indextypes";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
  locationName?: string;
  position?: string;
}

interface RegisterResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

function extractSafeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
}

function createJwtPayload(user: User): JwtPayload {
  return {
    userId: user.id,
    email: user.email,
    role: user.role as "employee" | "manager" | "admin",
  };
}

async function verifyUserPassword(
  user: User,
  password: string,
): Promise<void> {
  const isValid = await bcryptPasswordService.compare(password, user.password!);
  if (!isValid) {
    logger.warn("Login failed - invalid password", { email: user.email });
    throw new UnauthorizedError("Invalid credentials");
  }
}

async function generateAccessToken(user: User): Promise<string> {
  const payload = createJwtPayload(user);
  const token = await generateToken(payload);
  logger.debug("Access token generated", { userId: user.id });
  return token;
}

async function generateRefresh(user: User): Promise<string> {
  const payload = createJwtPayload(user);
  const token = await refreshTokenService.generate(payload);
  logger.debug("Refresh token generated", { userId: user.id });
  return token;
}

async function checkExistingUser(email: string): Promise<void> {
  const existing = await findByEmail(email);
  if (existing) {
    logger.warn("Registration failed - email already exists", { email });
    throw new ValidationError("Email already registered");
  }
}

function buildCreateUserInput(input: RegisterInput): CreateUserInput {
  return {
    email: input.email,
    password: input.password,
    name: input.name,
    role: input.role,
    locationName: input.locationName,
    position: input.position,
  };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  logger.info("Login attempt", { email: input.email });

  const user = await findByEmail(input.email, true) as User | null;
  if (!user || !user.password) {
    logger.warn("Login failed - user not found", { email: input.email });
    throw new UnauthorizedError("Invalid credentials");
  }

  await verifyUserPassword(user, input.password);

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefresh(user);
  const safeUser = extractSafeUser(user);

  logger.info("Login successful", { userId: user.id, email: user.email });

  return { user: safeUser, accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  logger.info("Registration attempt", { email: input.email });

  await checkExistingUser(input.email);

  const createInput = buildCreateUserInput(input);
  const newUser = await create(createInput);

  const userWithPassword = await findByEmail(input.email, true) as User;

  const accessToken = await generateAccessToken(userWithPassword);
  const refreshToken = await generateRefresh(userWithPassword);

  logger.info("Registration successful", { userId: newUser.id, email: newUser.email });

  return { user: newUser, accessToken, refreshToken };
}
