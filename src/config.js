import axios from "axios";
import { removeCookie } from "./Utils/cookies.jsx";

export const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

axios.defaults.withCredentials = true;
axios.interceptors.request.use((request) => {
  request.withCredentials = true;
  const authorization = request.headers?.Authorization;
  if (
    typeof authorization === "string" &&
    /Bearer (null|undefined)$/.test(authorization)
  ) {
    delete request.headers.Authorization;
  }
  return request;
});
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isPublicAuthRequest =
      request?.url?.endsWith("/users/sync") ||
      request?.url?.endsWith("/auth/logout");
    if (
      error.response?.status !== 401 ||
      !request ||
      request._authRecoveryAttempt ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    request._authRecoveryAttempt = true;
    try {
      await axios.get(`${API_BASE}/me`, {
        withCredentials: true,
        _authRecoveryAttempt: true,
      });
      return axios(request);
    } catch {
      removeCookie("user");
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(error);
    }
  },
);
