export const useDevMode = () => {
  const isDev = import.meta.dev
  
  return {
    isDev,
    isProd: !isDev
  }
}