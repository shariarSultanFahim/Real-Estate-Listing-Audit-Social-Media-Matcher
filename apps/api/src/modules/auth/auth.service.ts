import jwt from "jsonwebtoken";
import { config } from "../../config";
import { createError } from "../../middleware/errorHandler";
import { verifyCredentials, findById } from "../users/users.service";
import { AuthenticatedUser } from "../../middleware/auth";
import { User } from "@real-estate/types";

export interface LoginResponse {
  token: string;
  user: User;
}

export function generateToken(user: User): string {
  const payload: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    accountType: user.accountType as any,
    permissions: user.permissions as string[],
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const user = await verifyCredentials(email, password);
  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const token = generateToken(user);
  return { token, user };
}

export async function getProfile(userId: string): Promise<User> {
  return findById(userId);
}
