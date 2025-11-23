import { UpdateTypePayload } from "#common/models/validation/type.validation.js";
import { getSlug } from "#common/utils/text-utilities.js";

import { Type } from "../../models/type.model.js";

export class UpdateTypeService {
  async updateType(id: string, data: UpdateTypePayload) {
    const type = await Type.findById(id);
    if (!type) throw new Error("TYPE_NOT_FOUND");

    let newSlug = null;

    // nếu user truyền slug manually
    if (data.slug) newSlug = getSlug(data.slug);

    // nếu user đổi name => slug auto
    if (data.name) {
      const autoSlug = getSlug(data.name);
      newSlug = newSlug || autoSlug;
    }

    if (newSlug) {
      const exists = await Type.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (exists) throw new Error("TYPE_ALREADY_EXISTS");

      type.slug = newSlug;
    }

    if (data.name !== undefined) type.name = data.name;
    if (data.description !== undefined) type.description = data.description;

    await type.save();
    return type;
  }
}
