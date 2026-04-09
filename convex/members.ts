import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Populates a user by ID.
 *
 * @param {QueryCtx} ctx - The query context.
 * @param {Id<"users">} id - The ID of the user.
 *
 * @returns {Promise<Doc<"users"> | null>} The user.
 */
const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

/**
 * Retrieves all members of a workspace.
 * Verifies that the authenticated user is a member of the workspace.
 *
 * @query
 * @param {Object} args - The query arguments.
 * @param {Id<"workspaces">} args.workspaceId - The ID of the workspace.
 *
 * @returns {Promise<Array<Doc<"members"> & { user: Doc<"users"> } | null>>} The list of members.
 */
export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return [];
    }

    // Get all members of the workspace
    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const members = [];

    // Populate users for each member
    for (const m of data) {
      const user = await populateUser(ctx, m.userId);
      if (user) {
        members.push({ ...m, user });
      }
    }

    return members;
  },
});

/**
 * Retrieves a member by ID.
 * Verifies that the authenticated user is a member of the workspace.
 *
 * @query
 * @param {Object} args - The query arguments.
 * @param {Id<"members">} args.id - The ID of the member.
 *
 * @returns {Promise<Doc<"members"> & { user: Doc<"users"> } | null>} The member.
 */
export const getById = query({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);
    if (!user) {
      return null;
    }

    return { ...member, user };
  },
});

/**
 * Retrieves the current member of a workspace.
 * Verifies that the authenticated user is a member of the workspace.
 *
 * @query
 * @param {Object} args - The query arguments.
 * @param {Id<"workspaces">} args.workspaceId - The ID of the workspace.
 *
 * @returns {Promise<Doc<"members"> | null>} The current member.
 */
export const current = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return member;
  },
});

/**
 * Updates the role of a member in a workspace.
 * Verifies that the authenticated user is an admin of the workspace.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"members">} args.id - The ID of the member to update.
 * @param {"admin" | "member"} args.role - The new role of the member.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the member is not found ("Member not found").
 * @throws {Error} If the current member is not an admin ("Unauthorized").
 *
 * @returns {Promise<Id<"members">>}
 * The ID of the updated member.
 */
export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });

    return args.id;
  },
});

/**
 * Removes a member from a workspace.
 * Verifies that the authenticated user is an admin of the workspace.
 * Deletes all messages, reactions, and conversations associated with the member.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"members">} args.id - The ID of the member to remove.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the member is not found ("Member not found").
 * @throws {Error} If the current member is not an admin ("Unauthorized").
 * @throws {Error} If the member to remove is an admin ("Admin cannot be removed").
 * @throws {Error} If the current member is the same as the member to remove ("Cannot remove self if an admin").
 *
 * @returns {Promise<Id<"members">>}
 * The ID of the removed member.
 */
export const remove = mutation({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("Admin cannot be removed");
    }

    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("Cannot remove self if an admin");
    }

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), member._id),
          ),
        )
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
