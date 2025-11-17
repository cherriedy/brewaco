import { User } from "#common/models/user.model.js";
import { comparePassword } from "#common/utils/hash-password.js";
import { Types } from "mongoose";
import { passwordSchema } from "../../models/validation/auth.validation.js";

export class ChangePasswordService {
  /**
   * Thay đổi mật khẩu cho user
   * @param userId - id user
   * @param currentPassword - mật khẩu hiện tại
   * @param newPassword - mật khẩu mới
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    // Validate new password theo schema
    try {
      passwordSchema.parse(newPassword);
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error("NEW_PASSWORD_INVALID");
      throw err;
    }

    // Lấy user
    const user = await User.findById(userId).select("+password"); 
    if (!user) throw new Error("USER_NOT_FOUND");

    // So sánh mật khẩu hiện tại
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new Error("CURRENT_PASSWORD_INCORRECT");
    
    // Gán mật khẩu mới, pre-save hook sẽ hash tự động
    user.password = newPassword;
    await user.save();

    return true;
  }
}
