interface FormValues {
  usernameOrEmail: string;
  password: string;
}

interface FormErrors {
  usernameOrEmail?: string;
  password?: string;
}

const validation = (values: FormValues): FormErrors => {
  let errors: FormErrors = {};

  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/;

  if (!values.usernameOrEmail) {
    errors.usernameOrEmail = "Username or email is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!passwordPattern.test(values.password)) {
    errors.password = "Password is invalid";
  }

  // console.log(errors);

  return errors;
};

export default validation;
