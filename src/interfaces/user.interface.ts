import { Address } from "#interfaces/address.interface.js";
import { Role } from "#types/role.js";

export interface User {
  address?: Address;
  createdAt?: Date;
  email: string;
  name: string;
  password: string;
  phone?: string;
  resetCode?: string;
  resetCodeExp?: Date;
  resetToken?: string;
  resetTokenExp?: Date;
  role: Role;
  updatedAt?: Date;
}
