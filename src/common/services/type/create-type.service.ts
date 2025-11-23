import { CreateTypePayload } from "#common/models/validation/type.validation.js";
import { getSlug } from "#common/utils/text-utilities.js";

import { Type } from "../../models/type.model.js";

export class CreateTypeService {
  async createType(data: CreateTypePayload) {
    const slug = getSlug(data.slug || data.name);

    const existing = await Type.findOne({ slug });
    if (existing) throw new Error("TYPE_ALREADY_EXISTS");

    const type = new Type(data);
    await type.save();

    return type;
  }
}
