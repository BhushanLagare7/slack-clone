import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Id } from "./_generated/dataModel";
import { query, QueryCtx } from "./_generated/server";

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
