import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/services/authService";
import { AppError, toErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ENV } from "@/lib/config/envValidator";

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginBody = z.infer<typeof LoginSchema>;

function parseBody(request: NextRequest): Promise<unknown> {
  return request.json();
}

function validateBody(body: unknown): LoginBody {
  return LoginSchema.parse(body);
}

function createRefreshTokenCookie(refreshToken: string): string {
  const isProd = ENV.NODE_ENV === "production";
  const cookieParts = [
    `refreshToken=${refreshToken}`,
    "HttpOnly",
    isProd ? "Secure" : "",
    "SameSite=Strict",
    `Max-Age=${60 * 60 * 24 * 7}`,
    "Path=/",
  ].filter(Boolean);
  return cookieParts.join("; ");
}

function successResponse(
  user: unknown,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  const response = NextResponse.json({
    success: true,
    user,
    accessToken,
  });

  response.headers.set("Set-Cookie", createRefreshTokenCookie(refreshToken));
  return response;
}

function errorResponse(error: AppError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error.code,
      message: error.message,
    },
    { status: error.statusCode },
  );
}

function unknownErrorResponse(error: unknown): NextResponse {
  const message = toErrorMessage(error);
  logger.error("Unhandled login error", { error: message });

  return NextResponse.json(
    {
      success: false,
      error: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    },
    { status: 500 },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await parseBody(request);
    const validated = validateBody(body);

    const { user, accessToken, refreshToken } = await login(validated);

    return successResponse(user, accessToken, refreshToken);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: error.issues.map((issue: z.ZodIssue) => issue.message).join(", "),
        },
        { status: 400 },
      );
      return response;
    }
    return unknownErrorResponse(error);
  }
}
