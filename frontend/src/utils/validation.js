// src/utils/validation.js

// Validate UserID: 23341A0[1-5][A-Z][0-9]
export const validateUserId = (userId) => {
  const regex = /^23341A0[1-5][A-Z][0-9]$/;
  return regex.test(userId);
};

// Validate AdminID: ADM[001-300]
export const validateAdminId = (adminId) => {
  const regex = /^ADM(0[0-9][0-9]|[12][0-9][0-9]|300)$/;
  return regex.test(adminId);
};

// Validate Email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate Password (minimum 6 chars)
export const validatePassword = (password) => password.length >= 6;