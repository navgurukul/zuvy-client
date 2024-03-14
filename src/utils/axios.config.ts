"use client";

import axios, { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_MAIN_URL;

let headers: AxiosRequestConfig["headers"] = {
  "Content-Type": "application/json",
};

if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
}

const api = axios.create({
  baseURL,
  headers,
});

export default api;
