import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function useDatabase(event: Parameters<typeof useRuntimeConfig>[0]) {
  if (client) return client;

  const databaseUrl = useRuntimeConfig(event).databaseUrl;
  if (typeof databaseUrl !== "string" || !databaseUrl) {
    throw createError({
      statusCode: 503,
      message: "Voting database is not configured",
    });
  }

  client = postgres(databaseUrl, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return client;
}
