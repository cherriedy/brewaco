export const authConfig = {
  expireIn: 1, // Expiry time in hours for general auth tokens
  password: {
    length: 8, // Minimum password length requirement
    hashing: {
      saltRound: 10, // Number of salt rounds for password hashing
    },
  },
  pwForgot: {
    resetCode: {
      length: 6, // Number of digits in the reset code
      expire: 15, // Expiry time in minutes for the reset code
    },
    resetToken: {
      expireIn: 10, // Expiry time in minutes for the reset token
    },
  },
};
