export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  DEV_BYPASS_AUTH: (import.meta.env.VITE_DEV_BYPASS_AUTH as string) === "true",
};