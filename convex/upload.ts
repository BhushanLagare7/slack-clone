import { mutation } from "./_generated/server";

/**
 * Generates a secure upload URL for file uploads.
 *
 * This mutation creates a time-limited URL that can be used by the client
 * to upload files directly to Convex storage without exposing storage credentials.
 *
 * @mutation
 * @returns {Promise<string>} The generated upload URL
 *
 * @example
 * const uploadUrl = await generateUploadUrl();
 * // Returns: "https://storage.convex.cloud/upload/..."
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
