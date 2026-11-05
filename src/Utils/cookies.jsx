const cookieOptions = "Path=/; SameSite=Lax";

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return null;
  }
};

export const setCookie = (name, value, maxAgeSeconds = 60 * 60 * 24 * 7) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; ${cookieOptions}; Max-Age=${maxAgeSeconds}${secure}`;
};

export const removeCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${encodeURIComponent(name)}=; ${cookieOptions}; Max-Age=0`;
};
