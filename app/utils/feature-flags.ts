import { getUrlParamValue } from "./url";

export const isDebugMode = () => {
  if (import.meta.dev) return true;
  const paramValue = getUrlParamValue("isDebugMode");
  return paramValue?.toLowerCase() === "true";
};
