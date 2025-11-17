import { User } from "#common/models/user.model.js";
import { Types } from "mongoose";

export class GetUserProfileService {
  async getProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    const user = await User.findById(userId).select(
      "-password -resetToken -resetTokenExp -resetCode -resetCodeExp"
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  }
}
