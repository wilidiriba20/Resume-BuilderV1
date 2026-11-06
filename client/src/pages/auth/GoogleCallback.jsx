
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate processing in React StrictMode.
    if (hasProcessed.current) return;

    hasProcessed.current = true;

    const hashParams = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const token = hashParams.get("token");

    if (!token) {
      

      navigate("/login?error=google_auth_failed", {
        replace: true,
      });

      return;
    }

    try {
      // Store authentication token.
      sessionStorage.setItem("token", token);

      // Remove JWT from browser URL.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );


      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {

      sessionStorage.removeItem("token");

      navigate("/login?error=google_auth_failed", {
        replace: true,
      });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium text-slate-700">
        Completing Google sign-in...
      </p>
    </div>
  );
}
