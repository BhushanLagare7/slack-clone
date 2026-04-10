import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";

/**
 * Removes a channel and all its associated data.
 *
 * This mutation permanently deletes a channel along with all related data including:
 * - The channel document itself
 * - All messages belonging to the channel
 * - All reactions associated with those messages (cascaded via message deletion)
 * - All thread replies to those messages (cascaded via message deletion)
 *
 * **Authorization:** Only workspace admins can remove channels.
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"channels">} args.id - The unique identifier of the channel to remove
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Channel not found" - If the specified channel does not exist
 * @throws {Error} "Unauthorized" - If the authenticated user is not an admin of the workspace
 *
 * @returns {Promise<Id<"channels">>} The ID of the removed channel
 *
 * @example
 * const channelId = await remove({ id: "channel123" });
 */
export const remove = mutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(args.id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [messages] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
        .collect(),
    ]);

    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Updates an existing channel's name.
 *
 * The channel name is automatically normalized:
 * - Trimmed of leading/trailing whitespace
 * - Multiple spaces replaced with single hyphens
 * - Converted to lowercase
 *
 * **Authorization:** Only workspace admins can update channels.
 *
 * **Validation:**
 * - Name must be between 3 and 80 characters (after normalization)
 * - Name must be unique within the workspace
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"channels">} args.id - The unique identifier of the channel to update
 * @param {Id<"workspaces">} args.workspaceId - The workspace ID (for authorization verification)
 * @param {string} args.name - The new name for the channel
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Unauthorized" - If the user is not an admin of the workspace
 * @throws {Error} "Channel name must be between 3 and 80 characters long" - If name length is invalid
 * @throws {Error} "A channel with this name already exists in the workspace" - If the name is already in use
 *
 * @returns {Promise<Id<"channels">>} The ID of the updated channel
 *
 * @example
 * const channelId = await update({
 *   id: "channel123",
 *   workspaceId: "workspace456",
 *   name: "New Channel Name"
 * }); // Stored as "new-channel-name"
 */
export const update = mutation({
  args: {
    id: v.id("channels"),
    workspaceId: v.id("workspaces"),
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
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const parsedName = args.name.trim().replace(/\s+/g, "-").toLowerCase();

    if (parsedName.length < 3 || parsedName.length > 80) {
      throw new Error("Channel name must be between 3 and 80 characters long");
    }

    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", parsedName),
      )
      .unique();

    if (existingChannel) {
      throw new Error(
        "A channel with this name already exists in the workspace",
      );
    }

    await ctx.db.patch(args.id, {
      name: parsedName,
    });

    return args.id;
  },
});

/**
 * Creates a new channel in a workspace.
 *
 * The channel name is automatically normalized:
 * - Trimmed of leading/trailing whitespace
 * - Multiple spaces replaced with single hyphens
 * - Converted to lowercase
 *
 * **Authorization:** Only workspace admins can create channels.
 *
 * **Validation:**
 * - Name must be between 3 and 80 characters (after normalization)
 * - Name must be unique within the workspace
 *
 * @mutation
 * @param {Object} args - The mutation arguments
 * @param {Id<"workspaces">} args.workspaceId - The workspace where the channel will be created
 * @param {string} args.name - The name of the new channel
 *
 * @throws {Error} "Unauthorized" - If the user is not authenticated
 * @throws {Error} "Unauthorized" - If the user is not an admin of the workspace
 * @throws {Error} "Channel name must be between 3 and 80 characters long" - If name length is invalid
 * @throws {Error} "A channel with this name already exists in the workspace" - If the name is already in use
 *
 * @returns {Promise<Id<"channels">>} The ID of the newly created channel
 *
 * @example
 * const channelId = await create({
 *   workspaceId: "workspace456",
 *   name: "General Discussion"
 * }); // Stored as "general-discussion"
 */
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
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
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const parsedName = args.name.trim().replace(/\s+/g, "-").toLowerCase();

    if (parsedName.length < 3 || parsedName.length > 80) {
      throw new Error("Channel name must be between 3 and 80 characters long");
    }

    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", parsedName),
      )
      .unique();

    if (existingChannel) {
      throw new Error(
        "A channel with this name already exists in the workspace",
      );
    }

    const channelId = await ctx.db.insert("channels", {
      workspaceId: args.workspaceId,
      name: parsedName,
    });

    return channelId;
  },
});

/**
 * Retrieves a single channel by its ID.
 *
 * **Authorization:** User must be a member of the workspace that contains the channel.
 *
 * @query
 * @param {Object} args - The query arguments
 * @param {Id<"channels">} args.id - The unique identifier of the channel to retrieve
 *
 * @returns {Promise<Channel | null>} The channel object if found and authorized, null otherwise
 * @returns {null} If user is not authenticated, channel doesn't exist, or user is not a workspace member
 *
 * @example
 * const channel = await getById({ id: "channel123" });
 * if (channel) {
 *   console.log(channel.name, channel.workspaceId);
 * }
 */
export const getById = query({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.id);
    if (!channel) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return channel;
  },
});

/**
 * Retrieves all channels in a workspace.
 *
 * Returns all channels that belong to the specified workspace. The user must be
 * a member of the workspace to view its channels.
 *
 * **Authorization:** User must be a member of the workspace.
 *
 * @query
 * @param {Object} args - The query arguments
 * @param {Id<"workspaces">} args.workspaceId - The workspace ID to retrieve channels from
 *
 * @returns {Promise<Channel[]>} An array of channel objects in the workspace
 * @returns {Array} Empty array if user is not authenticated or not a workspace member
 *
 * @example
 * const channels = await get({ workspaceId: "workspace456" });
 * channels.forEach(channel => {
 *   console.log(channel.name);
 * });
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

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .collect();

    return channels;
  },
});
