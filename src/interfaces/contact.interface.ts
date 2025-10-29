import { ContactState } from "#types/contact-state.js";

export interface Contact {
  name: string;
  email: string;
  message: string;
  state: ContactState;
  createdAt?: Date;
}
