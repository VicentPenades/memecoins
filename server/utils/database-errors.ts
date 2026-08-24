type DbErrorLike = {
  code?: string;
  constraint_name?: string;
};

const asDbErrorLike = (error: unknown): DbErrorLike | null => {
  if (!error || typeof error !== "object") return null;
  return error as DbErrorLike;
};

export const isPostgresErrorCode = (error: unknown, code: string): boolean => {
  const dbError = asDbErrorLike(error);
  return dbError?.code === code;
};

export const isPostgresUniqueViolation = (error: unknown): boolean =>
  isPostgresErrorCode(error, "23505");

export const isPostgresMissingRelation = (error: unknown): boolean =>
  isPostgresErrorCode(error, "42P01");
