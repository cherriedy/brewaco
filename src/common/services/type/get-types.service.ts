import { pagingConfig } from "#config/app.js";
import { Type as IType } from "#interfaces/type.interface.js";
import { Page } from "#interfaces/page.interface.js";

import { Type } from "../../models/type.model.js";

export class GetTypesService {
  async getTypes(
    page = 0,
    pageSize: number,
    sortOrder: -1 | 1 = -1,
    sortBy: keyof IType = "updatedAt"
  ): Promise<Page<IType>> {
    const types = await Type.find()
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize)
      .limit(pageSize);

    const total = await Type.countDocuments();
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: types,
      page,
      pageSize,
      total,
      totalPages,
    };
  }
}
