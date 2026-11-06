
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import AuthButton from "../../components/auth/AuthButton";

import { MailIcon } from "../../components/auth/AuthIcons";

import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle email changes
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setStatus("");
  };

  // Validate email
  const validateForm = () => {
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // Handle password reset request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setStatus("");

      const response = await forgotPassword({
        email: email.trim(),
      });

      setStatus(
        response.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <h2>Forgot password?</h2>
        <p>
          No worries! Enter your email address and we'll send you a
          link to reset your password.
        </p>
      </div>

      {/* Status message */}
      {status && (
        <div
          className="auth-alert auth-alert-success"
          role="status"
        >
          {status}
        </div>
      )}

      {/* Forgot password form */}
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthField
          name="email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon />}
          value={email}
          onChange={handleChange}
          error={error}
          autoComplete="email"
          required
        />

        <AuthButton loading={loading}>
          Send Reset Link
        </AuthButton>
      </form>

      {/* Back to login */}
      <p className="auth-footer-text">
        Remember your password?{" "}
        <Link to="/login" className="auth-text-link">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
