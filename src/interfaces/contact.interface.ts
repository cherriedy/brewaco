import { ContactState } from "#types/contact.js";

export interface Contact {
  createdAt?: Date;
  email: string;
  message: string;
  name: string;
  state: ContactState;
}
