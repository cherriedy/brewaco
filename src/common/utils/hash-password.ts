import bcrypt from "bcrypt";
import { authConfig } from "../../config/app.js";

/**
 * Hashes a plain text password securely using bcrypt.
 * Bcrypt applies a salt and multiple rounds of hashing to protect against brute-force and rainbow table attacks.
 * @param password - The plain text password to be hashed.
 * @returns Promise<string> - Resolves to the bcrypt hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = authConfig.password.hashing.saltRound;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password to verify authentication.
 * Utilizes bcrypt for secure comparison, protecting against timing attacks.
 * @param password - The plain text password provided by the user.
 * @param hash - The bcrypt hashed password stored in the database.
 * @returns Promise<boolean> - Resolves to true if the password matches the hash, false otherwise.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
