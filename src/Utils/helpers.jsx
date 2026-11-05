import { toast } from "react-toastify";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { getCookie, removeCookie, setCookie } from "./cookies.jsx";

const USER_COOKIE = "user";
const TOKEN_COOKIE = "userAuthBearer";

const migrateLegacySession = (name) => {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(name);
    if (value) {
      setCookie(name, value);
      window.sessionStorage.removeItem(name);
    }
    return value;
  } catch {
    return null;
  }
};

export const authenticate = (data) => {
  if (data?.token) setCookie(TOKEN_COOKIE, data.token);
  if (data?.user) setCookie(USER_COOKIE, JSON.stringify(data.user));
};
export const getUser = () => {
  const value = getCookie(USER_COOKIE) || migrateLegacySession(USER_COOKIE);
  if (!value || value === "undefined") return null;

  try {
    return JSON.parse(value);
  } catch {
    removeCookie(USER_COOKIE);
    return null;
  }
};
export const getToken = () => {
  return (
    getCookie(TOKEN_COOKIE) ||
    migrateLegacySession(TOKEN_COOKIE) ||
    null
  );
};
export const logout = async () => {
  removeCookie(TOKEN_COOKIE);
  removeCookie(USER_COOKIE);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(TOKEN_COOKIE);
      window.sessionStorage.removeItem(USER_COOKIE);
    } catch {
      // Cookie removal is sufficient when session storage is unavailable.
    }
  }
  await signOut(auth);
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
      setCookie(TOKEN_COOKIE, token);
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
      removeCookie(TOKEN_COOKIE);
      removeCookie(USER_COOKIE);
    }
  });
