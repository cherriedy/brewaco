import { User } from "#common/models/user.model.js";
import { Types } from "mongoose";
import { UpdateUserPayload } from "#common/models/validation/user.validation.js";

export class UpdateUserService {
  async updateProfile(userId: string, data: UpdateUserPayload) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Update fields nếu có
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address !== undefined) user.address = { ...user.address, ...data.address };

    await user.save();

    // Return user mà không show các field nhạy cảm
    const { password, resetToken, resetTokenExp, resetCode, resetCodeExp, ...safeUser } = user.toObject();
    return safeUser;
  }
}
