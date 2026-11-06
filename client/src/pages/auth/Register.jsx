
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import AuthButton from "../../components/auth/AuthButton";
import GoogleButton from "../../components/auth/GoogleButton";

import {
  UserIcon,
  MailIcon,
  LockIcon,
  ShieldIcon,
} from "../../components/auth/AuthIcons";

import {
  registerUser,
  startGoogleAuth,
} from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Update form fields
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setStatus({ type: "", message: "" });
  };

  // Validate form before sending it to the backend
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (
      form.name.trim().length < 2 ||
      form.name.trim().length > 50
    ) {
      newErrors.name = "Name must be between 2 and 50 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 4) {
      newErrors.password = "Password must contain at least 4 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms to continue.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Register using email and password
  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatus({ type: "", message: "" });

    if (!validateForm()) return;

    try {
      setLoading(true);

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        acceptedTerms: form.acceptedTerms,
      });

      // The registration service stores the returned token.
      navigate("/dashboard");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Register using Google
  const handleGoogleAuth = async () => {
    if (!form.acceptedTerms) {
      setErrors((previous) => ({
        ...previous,
        acceptedTerms: "You must accept the terms to continue.",
      }));
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await startGoogleAuth(true);

      if (response.url) {
        window.location.assign(response.url);
      } else {
        throw new Error("Google authentication URL was not returned.");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to connect to Google. Please try again.",
      });

      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <h2 className="auth-card-title">Create your account</h2>

      <p className="auth-card-description">
        Start building your professional resume today.
      </p>

      {status.message && (
        <div
          className={`auth-status ${status.type}`}
          role="alert"
        >
          {status.message}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthField
          name="name"
          placeholder="Full name"
          icon={<UserIcon />}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />

        <AuthField
          name="email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon />}
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <AuthField
          name="password"
          type="password"
          placeholder="Create password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <AuthField
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          icon={<ShieldIcon />}
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div>
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
            />

            <span>
              I agree to the{" "}
              <Link to="/terms" className="auth-text-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="auth-text-link">
                Privacy Policy
              </Link>
            </span>
          </label>

          {errors.acceptedTerms && (
            <p className="auth-error" role="alert">
              {errors.acceptedTerms}
            </p>
          )}
        </div>

        <AuthButton loading={loading || googleLoading}>
          Create account
        </AuthButton>
      </form>

      <div className="auth-divider">or continue with</div>

      <GoogleButton
        onClick={handleGoogleAuth}
        loading={googleLoading}
        disabled={loading}
      />

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link to="/login" className="auth-text-link">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
