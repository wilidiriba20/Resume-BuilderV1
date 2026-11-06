import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/api/auth/register", userData);

  if (response.data.token) {
    sessionStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);

  if (response.data.token) {
    sessionStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const startGoogleAuth = async (acceptedTerms = false) => {
  const response = await api.post("/api/auth/google", {
    acceptedTerms,
  });

  return response.data;
};

export const logoutUser = () => {
  sessionStorage.removeItem("token");
};

export const forgotPassword = async (userData) => {
  const response = await api.post(
    "/api/auth/forgot-password",
    userData
  );

  return response.data;
};

export const resetPassword = async (token, userData) => {
  const response = await api.post(
    `/api/auth/reset-password/${token}`,
    userData
  );

  return response.data;
};