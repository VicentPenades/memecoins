export const getUrlParamValue = (key: string): string | null => {
  if (import.meta.server) return null;
  const url = new URL(location.href);
  return url.searchParams.get(key);
};
