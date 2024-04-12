"use client";

import axios, { AxiosRequestConfig } from "axios";

const mainURL = process.env.NEXT_PUBLIC_MAIN_URL;
const apiURL = process.env.NEXT_PUBLIC_API_URL;

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
  baseURL:mainURL,
  headers,
});

const apiMeraki = axios.create({
  baseURL:apiURL,
  headers,
});

export  {api, apiMeraki};
