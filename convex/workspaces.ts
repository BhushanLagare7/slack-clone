/**
 * Workspace Management Module
 *
 * This module provides mutations and queries for managing workspaces in a Convex application.
 * It handles workspace creation, joining, updating, and deletion, along with member management.
 *
 * @module workspaces
 */

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";

/**
 * Generates a random 6-character alphanumeric join code for workspace invitations.
 *
 * @private
 * @returns {string} A 6-character lowercase alphanumeric code (0-9, a-z)
 *
 * @example
 * const code = generateCode(); // Returns something like "a3k9z2"
 */
const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () =>
      "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)],
  ).join("");

  return code;
};

/**
 * Allows a user to join an existing workspace using a join code.
 *
 * Creates a new member record with "member" role if the join code is valid
 * and the user is not already a member of the workspace.
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {string} args.joinCode - The join code for the workspace (case-insensitive)
 * @param {Id<"workspaces">} args.workspaceId - The unique identifier of the workspace to join
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Workspace not found" - If the specified workspace does not exist
 * @throws {Error} "Invalid join code" - If the provided join code does not match the workspace's code
 * @throws {Error} "Already a member of this workspace" - If the user is already a member
 *
 * @returns {Promise<Id<"workspaces">>} The ID of the joined workspace
 *
 * @example
 * const workspaceId = await join({
 *   joinCode: "abc123",
 *   workspaceId: "workspace_id_here"
 * });
 */
export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
      throw new Error("Invalid join code");
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspace._id).eq("userId", userId),
      )
      .unique();

    if (existingMember) {
      throw new Error("Already a member of this workspace");
    }

    await ctx.db.insert("members", {
      workspaceId: workspace._id,
      userId,
      role: "member",
    });

    return workspace._id;
  },
});

/**
 * Generates a new join code for an existing workspace.
 *
 * This invalidates the previous join code and creates a new one. This is useful
 * for security purposes when you want to revoke access using the old code.
 *
 * **Authorization:** Only workspace admins can generate new join codes.
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"workspaces">} args.workspaceId - The unique identifier of the workspace
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Unauthorized" - If the user is not an admin of the workspace
 *
 * @returns {Promise<Id<"workspaces">>} The ID of the workspace with the updated join code
 *
 * @example
 * const workspaceId = await newJoinCode({ workspaceId: "workspace_id_here" });
 */
export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();

    await ctx.db.patch(args.workspaceId, {
      joinCode,
    });

    return args.workspaceId;
  },
});

/**
 * Creates a new workspace with the authenticated user as admin.
 *
 * This mutation performs several operations:
 * - Creates a new workspace with a randomly generated join code
 * - Adds the creator as an admin member
 * - Creates a default "general" channel
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {string} args.name - The name of the workspace to create
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 *
 * @returns {Promise<Id<"workspaces">>} The ID of the newly created workspace
 *
 * @example
 * const workspaceId = await create({ name: "My Team Workspace" });
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      workspaceId,
      userId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    });

    return workspaceId;
  },
});

/**
 * Retrieves all workspaces where the authenticated user is a member.
 *
 * This query finds all member records for the current user and returns
 * the corresponding workspace documents.
 *
 * @query
 * @returns {Promise<Array<Workspace>>} An array of workspace documents, or empty array if user is not authenticated
 *
 * @example
 * const myWorkspaces = await get();
 * // Returns: [{ _id: "...", name: "Workspace 1", ... }, ...]
 */
export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    // Get all the members for the current user
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // Get all the workspace ids from the members
    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    // Get all the workspaces from the workspace ids
    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) {
        workspaces.push(workspace);
      }
    }

    return workspaces;
  },
});

/**
 * Retrieves basic information about a workspace and the user's membership status.
 *
 * Returns the workspace name and whether the authenticated user is a member.
 * Unlike `getById`, this does not require membership to view basic information.
 *
 * @query
 * @param {Object} args - The query arguments
 * @param {Id<"workspaces">} args.id - The unique identifier of the workspace
 *
 * @returns {Promise<{name: string | undefined, isMember: boolean} | null>}
 *          Object containing workspace name and membership status, or null if user is not authenticated
 *
 * @example
 * const info = await getInfoById({ id: "workspace_id_here" });
 * // Returns: { name: "My Workspace", isMember: true }
 */
export const getInfoById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    const workspace = await ctx.db.get(args.id);

    return {
      name: workspace?.name,
      isMember: !!member,
    };
  },
});

/**
 * Retrieves a workspace by ID if the user is a member.
 *
 * **Authorization:** Only members of the workspace can view its details.
 *
 * @query
 * @param {Object} args - The query arguments
 * @param {Id<"workspaces">} args.id - The unique identifier of the workspace
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 *
 * @returns {Promise<Workspace | null>} The workspace document, or null if user is not a member
 *
 * @example
 * const workspace = await getById({ id: "workspace_id_here" });
 * // Returns: { _id: "...", name: "My Workspace", joinCode: "...", userId: "..." }
 */
export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return await ctx.db.get(args.id);
  },
});

/**
 * Updates the name of an existing workspace.
 *
 * **Authorization:** Only workspace admins can update workspace details.
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"workspaces">} args.id - The unique identifier of the workspace to update
 * @param {string} args.name - The new name for the workspace
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Unauthorized" - If the user is not an admin of the workspace
 *
 * @returns {Promise<Id<"workspaces">>} The ID of the updated workspace
 *
 * @example
 * const workspaceId = await update({
 *   id: "workspace_id_here",
 *   name: "Updated Workspace Name"
 * });
 */
export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
    });

    return args.id;
  },
});

/**
 * Permanently removes a workspace and all its associated data.
 *
 * This mutation performs a cascading delete of:
 * - All workspace members
 * - All channels in the workspace
 * - All conversations in the workspace
 * - All messages in the workspace
 * - All reactions in the workspace
 * - The workspace document itself
 *
 * **Authorization:** Only workspace admins can remove workspaces.
 *
 * **Warning:** This operation is irreversible and will permanently delete all workspace data.
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"workspaces">} args.id - The unique identifier of the workspace to remove
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Unauthorized" - If the user is not an admin of the workspace
 *
 * @returns {Promise<Id<"workspaces">>} The ID of the removed workspace
 *
 * @example
 * const workspaceId = await remove({ id: "workspace_id_here" });
 */
export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [members, channels, conversations, messages, reactions] =
      await Promise.all([
        ctx.db
          .query("members")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("channels")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("conversations")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("messages")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("reactions")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
      ]);

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
