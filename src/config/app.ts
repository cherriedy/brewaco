export const pagingConfig = {
  pageSize: 10, // Default number of items per page
};
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
export const reviewConfig = {
  rating: {
    minValue: 1, // Min value of rating
    maxValue: 5, // Max value of rating
  },
  comment: {
    minLength: 10, // Min length of comment
    maxLength: 500, // Max length of comment
  },
};
export const contactConfig = {
  name: {
    minLength: 10, // Min length of name
  },
  message: {
    minLength: 50, // Min length of message
    maxLength: 500, // Max length of message
  },
};
