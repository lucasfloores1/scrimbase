const ACCESS_TOKEN_KEY = "sb_access_token";
const REFRESH_TOKEN_KEY = "sb_refresh_token";

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccess(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefresh(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};