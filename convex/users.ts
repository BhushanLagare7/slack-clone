import { getAuthUserId } from "@convex-dev/auth/server";

import { query } from "./_generated/server";

/**
 * Retrieves the currently authenticated user.
 *
 * @query
 * @returns {Promise<User | null>} The user document, or null if not authenticated
 *
 * @example
 * const user = await current();
 * // Returns: { _id: "...", name: "John Doe", email: "[EMAIL_ADDRESS]", ... }
 */
export const current = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) return null;

    return await ctx.db.get(userId);
  },
});
