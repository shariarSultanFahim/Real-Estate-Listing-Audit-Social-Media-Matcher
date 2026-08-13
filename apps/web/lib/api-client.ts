import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/mock";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
