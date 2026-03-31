const DEFAULT_LOCAL_API = "http://localhost:5000";

export const BACKEND_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : DEFAULT_LOCAL_API;

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const baseUrl = BACKEND_URL?.replace(/\/+$/, "") || "";
    return `${baseUrl}${normalizedPath}`;
};

