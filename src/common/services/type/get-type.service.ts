import mongoose from "mongoose";
import { Type } from "../../models/type.model.js";

export class GetTypeService {
  async getType(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_TYPE_ID");
    }

    const type = await Type.findById(id);
    if (!type) throw new Error("TYPE_NOT_FOUND");

    return type;
  }
}
