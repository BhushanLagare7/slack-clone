import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation } from "./_generated/server";

/**
 * Creates a new conversation or retrieves an existing one between two members.
 * Verifies that the authenticated user is a member of the workspace and that
 * both members are in the same workspace.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"workspaces">} args.workspaceId - The ID of the workspace.
 * @param {Id<"members">} args.memberId - The ID of the other member.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the member is not found ("Member not found").
 * @throws {Error} If the other member is not found in the same workspace ("Other member not found in the same workspace").
 *
 * @returns {Promise<Id<"conversations">>} The conversation ID.
 */
export const createOrGet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    const otherMember = await ctx.db.get(args.memberId);

    if (!currentMember || !otherMember) {
      throw new Error("Member not found");
    }

    if (otherMember.workspaceId !== args.workspaceId) {
      throw new Error("Other member not found in the same workspace");
    }

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id),
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id),
          ),
        ),
      )
      .unique();

    if (existingConversation) {
      return existingConversation._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
    });

    return conversationId;
  },
});
