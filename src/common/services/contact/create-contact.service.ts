import { Contact } from "#common/models/contact.model.js";
import { CreateContactPayload } from "#common/models/validation/contact.validation.js";

export class CreateContactService {
  /**
   * Creates a new contact and saves it to the database.
   *
   * @param data - The payload containing contact information.
   * @returns The created contact instance.
   */
  async createContact(data: CreateContactPayload) {
    const contact = new Contact(data);
    await contact.save();
    return contact;
  }
}
