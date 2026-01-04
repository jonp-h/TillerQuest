import { Prisma } from "@prisma/client";
import { DateToString } from "./apiResponse";

/**
 * Wish with all vote relations and user data
 * Used for displaying wishes in the Wishing Well
 *
 * Note: Dates are strings because this comes from API (JSON serialized)
 */
export type WishWithVotes = DateToString<
  Prisma.WishGetPayload<{
    include: {
      wishVotes: {
        include: {
          user: {
            select: {
              username: true;
            };
          };
        };
      };
    };
  }>
>;

/**
 * Individual wish vote with user information
 * Used for displaying vote history
 */
export type WishVoteWithUser = DateToString<
  Prisma.WishVoteGetPayload<{
    include: {
      user: {
        select: {
          username: true;
          id: true;
        };
      };
    };
  }>
>;
