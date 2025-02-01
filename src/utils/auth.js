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
    const { data } = await axios.post("user/register/", {
      full_name,
      email,
      phone,
      password,
      password2,
    });

    await login(email, password);

    // Alert the user that they have successfully registered
    Toast.fire({
      icon: "success",
      title: "Register successfully",
    });

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response.data?.detail || "Something went wrong",
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
