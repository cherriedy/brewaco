import { Type } from "../../models/type.model.js";

export class DeleteTypeService {
  async deleteType(id: string) {
    const type = await Type.findByIdAndDelete(id);
    if (!type) throw new Error("TYPE_NOT_FOUND");
    return type;
  }
}
