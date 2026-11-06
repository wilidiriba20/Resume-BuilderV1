
import { useState } from "react";

function AuthField({
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error,
  autoComplete,
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="auth-field-wrapper">
      <label
        className={`auth-field ${error ? "has-error" : ""}`}
      >
        {/* Input icon */}
        {icon && (
          <span className="auth-field-icon">
            {icon}
          </span>
        )}

        {/* Input */}
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          aria-label={placeholder}
          aria-invalid={Boolean(error)}
        />

        {/* Password visibility button */}
        {isPassword && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a14.5 14.5 0 0 1-4 4.7" />
                <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3-.5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </label>

      {/* Validation message */}
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthField;
