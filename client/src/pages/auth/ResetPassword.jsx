
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import AuthButton from "../../components/auth/AuthButton";

import {
  LockIcon,
} from "../../components/auth/AuthIcons";

import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!form.password) {
      newErrors.password = "New password is required.";
    } else if (form.password.length < 4) {
      newErrors.password =
        "Password must be at least 4 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle password reset
 const handleSubmit = async (e) => {
  e.preventDefault();


  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);
    setStatus("");


    const response = await resetPassword(token, {
  password: form.password,
  confirmPassword: form.confirmPassword,
});

    setStatus(
      response.message || "Password reset successfully."
    );

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);

  } catch (error) {
   
    setStatus(
      error.response?.data?.message ||
      "Unable to reset your password. Please try again."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <h2>Create a new password</h2>
        <p>
          Choose a strong password to secure your account.
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

      {/* Reset password form */}
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthField
          name="password"
          type="password"
          placeholder="New password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <AuthField
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          icon={<LockIcon />}
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <AuthButton loading={loading}>
          Reset Password
        </AuthButton>
      </form>

      <p className="auth-footer-text">
        Remember your password?{" "}
        <Link to="/login" className="auth-text-link">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
