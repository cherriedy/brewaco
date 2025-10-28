import { Role } from "#interfaces/role.interface.js";
import { Address } from "#interfaces/address.interface.js";

export interface User {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role: Role;
  address?: Address;
  createdAt?: Date;
  updatedAt?: Date;
  resetToken?: string;
  resetTokenExp?: Date;
  resetCode?: string;
  resetCodeExp?: Date;
}
