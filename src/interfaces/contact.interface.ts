import { ContactState } from "#types/contact-state.js";

export interface Contact {
  createdAt?: Date;
  email: string;
  message: string;
  name: string;
  state: ContactState;
}
