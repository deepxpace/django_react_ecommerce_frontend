import { useAuthStore } from "../store/auth";
import axios from "./axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import { Toast } from "../views/base/Alert";

export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post("user/token/", {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);

      // Alert the user that they have successfully logged in
      Toast.fire({
        icon: "success",
        title: "Login successfully",
      });
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response.data?.detail || "Something went wrong",
    };
  }
};

export const register = async (
  full_name,
  email,
  phone,
  password,
  password2
) => {
  try {
    // Validate the passwords match
    if (password !== password2) {
      return {
        data: null,
        error: "Passwords do not match",
      };
    }

    // Check password length
    if (password.length < 8) {
      return {
        data: null,
        error: "Password must be at least 8 characters long",
      };
    }

    console.log("Sending registration request with data:", {
      full_name,
      email,
      phone,
      password: "******", // Don't log actual password
    });

    const { data } = await axios.post("user/register/", {
      full_name,
      email,
      phone,
      password,
      password2,
    });

    console.log("Registration successful, attempting login");
    
    await login(email, password);

    // Alert the user that they have successfully registered
    Toast.fire({
      icon: "success",
      title: "Registration successful",
    });

    return { data, error: null };
  } catch (error) {
    console.error("Registration error:", error.response?.data || error);
    
    // Extract the specific error message
    let errorMessage = "Something went wrong";
    
    if (error.response?.data) {
      if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.email) {
        errorMessage = `Email error: ${error.response.data.email[0]}`;
      } else if (error.response.data.password) {
        errorMessage = `Password error: ${error.response.data.password[0]}`;
      } else if (error.response.data.phone) {
        errorMessage = `Phone error: ${error.response.data.phone[0]}`;
      } else if (error.response.data.full_name) {
        errorMessage = `Name error: ${error.response.data.full_name[0]}`;
      }
    }
    
    return {
      data: null,
      error: errorMessage,
    };
  }
};

export const logout = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  useAuthStore.getState().setUser(null);

  // Alert the user that they have successfully logged out
  Toast.fire({
    icon: "success",
    title: "Logout successfully",
  });
};

export const setUser = async () => {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return;
  }

  if (isAccessTokenExpired(accessToken)) {
    const response = await getRefreshToken(refreshToken);
    setAuthUser(response.access, response.refresh);
  } else {
    setAuthUser(accessToken, refreshToken);
  }
};

export const setAuthUser = (access_token, refresh_token) => {
  Cookies.set("access_token", access_token, {
    expires: 1,
    secure: true,
  });

  Cookies.set("refresh_token", refresh_token, {
    expires: 1,
    secure: true,
  });

  const user = jwtDecode(access_token) ?? null;

  if (user) {
    useAuthStore.getState().setUser(user);
  }

  useAuthStore.getState().setLoading(false);
};

export const getRefreshToken = async () => {
  const refresh_token = Cookies.get("refresh_token");
  const response = await axios.post("user/token/refresh/", {
    refresh: refresh_token,
  });

  return response.data;
};

export const isAccessTokenExpired = (accessToken) => {
  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.exp < Date.now() / 100;
  } catch (error) {
    return true;
  }
};

/**
 * Request a password reset for the given email
 * @param {string} email - The email address to send reset link to
 */
export const requestPasswordReset = async (email) => {
  try {
    const { status } = await axios.get(`user/password-reset/${email}/`);
    
    if (status === 200) {
      Toast.fire({
        icon: "success",
        title: "Password reset link sent to your email",
      });
    }
    
    return { error: null };
  } catch (error) {
    return {
      error: error.response?.data?.detail || "User with this email was not found",
    };
  }
};

/**
 * Reset a password using the OTP and user ID
 * @param {string} otp - One-time password from the email link
 * @param {string} uidb64 - User ID from the email link
 * @param {string} password - New password
 */
export const resetPassword = async (otp, uidb64, password) => {
  try {
    const { data, status } = await axios.post("user/password-change/", {
      otp,
      uidb64,
      password,
    });
    
    if (status === 200) {
      Toast.fire({
        icon: "success",
        title: "Password changed successfully",
      });
    }
    
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || "Failed to reset password",
    };
  }
};
