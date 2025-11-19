import { UpdateContactStatePayload } from "#common/models/validation/contact.validation.js";
import { Types } from "mongoose";
import { Contact } from "../../models/contact.model.js";

export class UpdateContactStateService {
  // Validate status transitions
  private validTransitions: Record<string, string[]> = {
    new: ["replied"],
    replied: [],
  };

  async updateContactState(contactId: string, data: UpdateContactStatePayload) {
    const contact = await Contact.findById(new Types.ObjectId(contactId));
    if (!contact) throw new Error("CONTACT_NOT_FOUND");

    if (!contact.state) {
      throw new Error("CONTACT_INVALID_STATE");
    }
    if (data.state) {
      const allowed = this.validTransitions[contact.state];
      if (!allowed.includes(data.state)) throw new Error("CONTACT_INVALID_STATE_TRANSITION");

      contact.state = data.state;
    }
    
    await contact.save();
    return contact;
  }
}