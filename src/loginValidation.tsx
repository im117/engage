interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const validation = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!passwordPattern.test(values.password)) {
    errors.password = "Password is invalid";
  }

  return errors;
};

export default validation;
