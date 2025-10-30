export const pagingConfig = {
  maxPageSize: 100, // Maximum number of items per page
  pageSize: 20, // Default number of items per page
};
export const searchConfig = {
  query: {
    endIndex: 200, // If the search query supports slicing, the end index
    startIndex: 0, // If the search query supports slicing, the start index
  },
};
export const authConfig = {
  expireIn: 1, // Expiry time in hours for general auth tokens
  password: {
    hashing: {
      saltRound: 10, // Number of salt rounds for password hashing
    },
    length: 8, // Minimum password length requirement
  },
  pwForgot: {
    resetCode: {
      expire: 15, // Expiry time in minutes for the reset code
      length: 6, // Number of digits in the reset code
    },
    resetToken: {
      expireIn: 10, // Expiry time in minutes for the reset token
    },
  },
};
export const reviewConfig = {
  comment: {
    maxLength: 500, // Max length of comment
    minLength: 10, // Min length of comment
  },
  rating: {
    maxValue: 5, // Max value of rating
    minValue: 1, // Min value of rating
  },
};
export const contactConfig = {
  message: {
    maxLength: 500, // Max length of message
    minLength: 50, // Min length of message
  },
  name: {
    minLength: 10, // Min length of name
  },
};
