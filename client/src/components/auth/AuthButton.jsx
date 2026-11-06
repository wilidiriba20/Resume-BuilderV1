
function AuthButton({
  children,
  loading = false,
  disabled = false,
  type = "submit",
}) {
  return (
    <button
      type={type}
      className="auth-button auth-button-primary"
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="auth-spinner" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AuthButton;
