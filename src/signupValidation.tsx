interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
}

const validation = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

  // Name validation
  if (!values.username.trim()) {
    errors.username = "Username is required";
  } else if (values.username.length > 50) {
    errors.username = "Username must be 50 characters or less";
  }

  // Email validation
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Email is invalid";
  } else if (values.email.length > 50) {
    errors.email = "Email must be 50 characters or less";
  }

  // Password validation
  if (!values.password) {
    errors.password = "Password is required";
  } else if (!passwordPattern.test(values.password)) {
    errors.password =
      "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number and one special character.";
  }

  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export default validation;
