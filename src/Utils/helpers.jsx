import axios from "axios";
import { toast } from "react-toastify";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { getCookie, removeCookie, setCookie } from "./cookies.jsx";
import { API_BASE } from "../config.js";

const USER_COOKIE = "user";
let compatibilityToken = null;

export const authenticate = (data) => {
  if (data?.token) compatibilityToken = data.token;
  if (data?.user) setCookie(USER_COOKIE, JSON.stringify(data.user));
};
export const getUser = () => {
  const value = getCookie(USER_COOKIE);
  if (!value || value === "undefined") return null;

  try {
    return JSON.parse(value);
  } catch {
    removeCookie(USER_COOKIE);
    return null;
  }
};
export const clearUser = () => removeCookie(USER_COOKIE);
export const getToken = () => compatibilityToken;
export const authConfig = () => ({
  withCredentials: true,
  ...(compatibilityToken
    ? { headers: { Authorization: `Bearer ${compatibilityToken}` } }
    : {}),
});
export const logout = async () => {
  let requestError = null;
  try {
    await axios.post(`${API_BASE}/auth/logout`, null, {
      withCredentials: true,
    });
  } catch (error) {
    requestError = error;
  } finally {
    compatibilityToken = null;
    removeCookie(USER_COOKIE);
    await signOut(auth);
  }
  if (requestError) throw requestError;
};
const firebaseMessages = {
  "auth/email-already-in-use":
    "This email already has an account. Sign in instead.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/operation-not-allowed":
    "Email/password registration is disabled in Firebase Authentication.",
  "auth/network-request-failed":
    "Firebase could not connect. Check your internet connection.",
};
export const errMsg = (error) => {
  const code = error?.code || "";
  const message =
    firebaseMessages[code] ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";
  toast.error(
    message.replace("Firebase: ", "").replace(/ \(auth\/[^)]+\)\.?$/, ""),
    { position: "bottom-right" },
  );
};
export const successMsg = (message) =>
  toast.success(message, { position: "bottom-right" });
if (typeof window !== "undefined")
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      compatibilityToken = token;
      if (!getCookie(USER_COOKIE))
        setCookie(
          USER_COOKIE,
          JSON.stringify({
            name: user.displayName || user.email?.split("@")[0],
            email: user.email,
            firebaseUid: user.uid,
          }),
        );
    } else {
      compatibilityToken = null;
      removeCookie(USER_COOKIE);
    }
  });
