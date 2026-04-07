import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";

/**
 * Looks up a workspace member record matching both a workspace and a user.
 * Used to verify workspace membership and retrieve the member's details.
 *
 * @param {QueryCtx} ctx - The Convex query context used to access the database.
 * @param {Id<"workspaces">} workspaceId - The ID of the workspace to search within.
 * @param {Id<"users">} userId - The ID of the user to look up.
 * @returns {Promise<Doc<"members"> | null>} The member document if found, or `null` if
 * the user is not a member of the specified workspace.
 */
const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) => {
  const member = await ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

  return member;
};

/**
 * Toggles a reaction on a specific message for the authenticated user.
 * If the user has already reacted with the same emoji, the reaction is removed.
 * Otherwise, a new reaction is created.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"messages">} args.messageId - The ID of the message to react to.
 * @param {string} args.value - The emoji value of the reaction (e.g., "👍", "❤️").
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the message to react to is not found ("Message not found").
 * @throws {Error} If the authenticated user is not a member of the message's workspace ("Member not found").
 *
 * @returns {Promise<Id<"reactions">>} The ID of the created or deleted reaction.
 */
export const toggle = mutation({
  args: {
    messageId: v.id("messages"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { messageId, value } = args;
    const message = await ctx.db.get(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member) {
      throw new Error("Member not found");
    }

    const existingReactionFromUser = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), value),
        ),
      )
      .first();

    if (existingReactionFromUser) {
      await ctx.db.delete(existingReactionFromUser._id);

      return existingReactionFromUser._id;
    } else {
      const newReactionId = await ctx.db.insert("reactions", {
        messageId,
        value,
        memberId: member._id,
        workspaceId: message.workspaceId,
      });

      return newReactionId;
    }
  },
});
