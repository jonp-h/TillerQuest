/**
 * Converts Date fields in Prisma types to strings
 * Use this for data fetched from API endpoints (JSON serialized)
 *
 * Why? Prisma types define dates as Date objects, but when data is sent
 * over HTTP as JSON, dates are serialized to ISO strings.
 *
 * @example
 * type UserFromAPI = DateToString<Prisma.UserGetPayload<{...}>>;
 */
export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date | null
    ? string | null
    : T[K] extends Date
      ? string
      : T[K] extends object
        ? DateToString<T[K]>
        : T[K];
};
