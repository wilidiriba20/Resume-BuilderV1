
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import AuthButton from "../../components/auth/AuthButton";
import GoogleButton from "../../components/auth/GoogleButton";

import {
  MailIcon,
  LockIcon,
} from "../../components/auth/AuthIcons";

import {
  loginUser,
  startGoogleAuth,
} from "../../services/authService";

const googleAuthErrors = {
  terms_required:
    "No account exists for this Google sign-in yet. Choose Create account, accept the terms, then continue with Google.",
  another_google_account_linked:
    "This email is linked to a different Google account. Sign in with that Google account.",
  google_verification_failed:
    "Google could not verify this account. Please try again with a verified Google email.",
  invalid_email:
    "Google did not provide a valid email address. Please try another account.",
  google_auth_failed:
    "Google sign-in could not be completed. Please try again.",
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(
    googleAuthErrors[searchParams.get("error")] ||
      (searchParams.has("error")
        ? "Google sign-in could not be completed. Please try again."
        : "")
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setStatus("");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setStatus("");

      await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/dashboard");
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setStatus("");

      const response = await startGoogleAuth();

      window.location.assign(response.url);
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
        "Unable to connect to Google. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <h2>Welcome back!</h2>
        <p>Sign in to continue building your professional resume.</p>
      </div>

      {/* Login status */}
      {status && (
        <div className="auth-alert auth-alert-error" role="alert">
          {status}
        </div>
      )}

      {/* Login form */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          name="email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon />}
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          required
        />

        <AuthField
          name="password"
          type="password"
          placeholder="Password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="auth-forgot-password">
          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <AuthButton
          loading={loading}
          disabled={googleLoading}
        >
          Sign in
        </AuthButton>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      {/* Google login */}
      <GoogleButton
        onClick={handleGoogleLogin}
        loading={googleLoading}
        disabled={loading}
      />

      {/* Registration link */}
      <p className="auth-footer-text">
        Don't have an account?{" "}
        <Link to="/register" className="auth-text-link">Create account</Link>
      </p>
      
    </AuthLayout>
  );
}
