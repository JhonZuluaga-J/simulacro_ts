import { prisma } from "@/lib/prisma";
import { users as PrismaUser } from "@prisma/client";
import { bcryptPasswordService } from "@/services/bcryptService";
import { handleNotFoundError, handleDuplicateError } from "@/lib/prismaErros/userErrorHandler";
import { logger } from "@/lib/logger";
import type { User, SafeUser, CreateUserInput, UpdateUserInput } from "@/types/indextypes";

function mapToUserInternal(data: PrismaUser): User {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    password: data.password ?? undefined,
    role: data.role as User["role"],
    locationName: data.locationName ?? undefined,
    position: data.position ?? undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function mapToSafeUser(data: PrismaUser): SafeUser {
  const { password, ...userWithoutPassword } = mapToUserInternal(data);
  return userWithoutPassword;
}

export async function findByEmail(email: string, forAuth?: boolean): Promise<User | SafeUser | null> {
  logger.debug("User lookup", { method: "findByEmail", email });
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return null;
  return forAuth ? mapToUserInternal(user) : mapToSafeUser(user);
}

export async function findById(id: string, forAuth?: boolean): Promise<User | SafeUser | null> {
  logger.debug("User lookup", { method: "findById", id });
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return null;
  return forAuth ? mapToUserInternal(user) : mapToSafeUser(user);
}

export async function create(data: CreateUserInput): Promise<SafeUser> {
  const hashedPassword = await bcryptPasswordService.hash(data.password);

  const newUser = await handleDuplicateError(
    prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        ...(data.role && { role: data.role }),
        ...(data.locationName && { locationName: data.locationName }),
        ...(data.position && { position: data.position }),
      },
    }),
    data.email,
  ) as PrismaUser;

  logger.info("User created", { userId: newUser.id, email: newUser.email, role: newUser.role });
  return mapToSafeUser(newUser);
}

export async function update(id: string, data: UpdateUserInput): Promise<SafeUser> {
  const { password, role, name, email, locationName, position } = data;

  const updatedUser = await handleNotFoundError(
    prisma.users.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(locationName && { locationName }),
        ...(position && { position }),
        ...(password && { password: await bcryptPasswordService.hash(password) }),
      },
    }),
    id,
  );

  logger.info("User updated", { userId: id, updatedFields: Object.keys(data) });
  return mapToSafeUser(updatedUser);
}

export async function deleteById(id: string): Promise<SafeUser> {
  const deletedUser = await handleNotFoundError(
    prisma.users.delete({ where: { id } }),
    id,
  ) as PrismaUser;

  logger.info("User deleted", { userId: deletedUser.id, email: deletedUser.email });
  return mapToSafeUser(deletedUser);
}