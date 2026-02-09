export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhoneNumber = (phone: string) => {
  // Basic validation, can be enhanced
  return phone.length >= 10;
};
