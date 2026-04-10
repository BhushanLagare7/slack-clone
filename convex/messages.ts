/**
 * @module messages
 * @description Handles all message-related operations including querying, creating,
 * and enriching messages with thread counts, reactions, and user information.
 * Supports channel messages, direct conversation messages, and threaded replies.
 */

import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Retrieves thread information for a given parent message.
 * Calculates the total reply count, the avatar of the last replier,
 * and the timestamp of the most recent reply.
 *
 * @param {QueryCtx} ctx - The Convex query context used to access the database.
 * @param {Id<"messages">} messageId - The ID of the parent message whose thread to populate.
 * @returns {Promise<{ count: number; image: string | undefined; timestamp: number }>}
 * An object containing:
 * - `count`: Total number of replies in the thread (0 if no replies or member not found).
 * - `image`: Profile image URL of the user who sent the last reply, or `undefined`.
 * - `timestamp`: Creation timestamp of the last reply, or 0 if none exist.
 */
const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const threadMessages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId),
    )
    .collect();

  if (threadMessages.length === 0) {
    return { count: 0, image: undefined, timestamp: 0, name: "" };
  }

  const lastMessage = threadMessages[threadMessages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return { count: 0, image: undefined, timestamp: 0, name: "" };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: threadMessages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};

/**
 * Retrieves all reactions associated with a specific message.
 *
 * @param {QueryCtx} ctx - The Convex query context used to access the database.
 * @param {Id<"messages">} messageId - The ID of the message whose reactions to fetch.
 * @returns {Promise<Doc<"reactions">[]>} An array of reaction documents for the message.
 */
const populateReactions = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  return await ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

/**
 * Retrieves a user document by their user ID.
 *
 * @param {QueryCtx} ctx - The Convex query context used to access the database.
 * @param {Id<"users">} userId - The ID of the user to fetch.
 * @returns {Promise<Doc<"users"> | null>} The user document, or `null` if not found.
 */
const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

/**
 * Retrieves a member document by their member ID.
 *
 * @param {QueryCtx} ctx - The Convex query context used to access the database.
 * @param {Id<"members">} memberId - The ID of the member to fetch.
 * @returns {Promise<Doc<"members"> | null>} The member document, or `null` if not found.
 */
const populateMember = async (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

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
 * Updates an existing message in a channel, conversation, or thread.
 * Verifies that the authenticated user is the author of the message before updating.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"messages">} args.id - The ID of the message to update.
 * @param {string} args.body - The new text content of the message.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the message to update is not found ("Message not found").
 * @throws {Error} If the authenticated user is not the author of the message ("Unauthorized").
 *
 * @returns {Promise<Id<"messages">>} The ID of the updated message.
 */
export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { id, body } = args;
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(id, {
      body,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Removes an existing message in a channel, conversation, or thread.
 * Verifies that the authenticated user is the author of the message before removing.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {Id<"messages">} args.id - The ID of the message to remove.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the message to remove is not found ("Message not found").
 * @throws {Error} If the authenticated user is not the author of the message ("Unauthorized").
 *
 * @returns {Promise<Id<"messages">>} The ID of the removed message.
 */
export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Queries a single message by its ID and enriches it with:
 * - Member and user information of the sender.
 * - A resolved image URL (if the message contains an image).
 * - Deduplicated reactions with counts and a list of reacting member IDs.
 *
 * @query
 * @param {Object} args - The query arguments.
 * @param {Id<"messages">} args.id - The ID of the message to query.
 *
 * @returns {Promise<EnrichedMessage | null>} The enriched message, or `null` if not found.
 */
export const getById = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      return null;
    }

    const currentMember = await getMember(ctx, message.workspaceId, userId);

    if (!currentMember) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);

    if (!member) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    const reactions = await populateReactions(ctx, message._id);
    // Count how many times each reaction value appears across all reactions
    const reactionsWithCount = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });

    /**
     * Deduplicate reactions by emoji value.
     * Merges reactions with the same value into a single entry,
     * accumulating unique member IDs in the `memberIds` array.
     */
    const dedupedReactions = reactionsWithCount.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId]),
          );
        } else {
          acc.push({
            ...reaction,
            memberIds: [reaction.memberId],
          });
        }

        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[],
    );

    // Remove the raw `memberId` field since memberIds array is now used instead
    const reactionsWithoutMemberIdProperty = dedupedReactions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ memberId, ...rest }) => rest,
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      member,
      user,
      reactions: reactionsWithoutMemberIdProperty,
    };
  },
});

/**
 * Queries a paginated list of messages filtered by channel, conversation, or parent message.
 * Each message is enriched with:
 * - Member and user information of the sender.
 * - A resolved image URL (if the message contains an image).
 * - Deduplicated reactions with counts and a list of reacting member IDs.
 * - Thread metadata (reply count, last replier's avatar, and last reply timestamp).
 *
 * @query
 * @param {Object} args - The query arguments.
 * @param {Id<"channels">} [args.channelId] - Filter messages by channel ID.
 * @param {Id<"conversations">} [args.conversationId] - Filter messages by conversation ID.
 * @param {Id<"messages">} [args.parentMessageId] - Filter to replies of a specific parent message (thread view).
 * @param {PaginationOptions} args.paginationOpts - Pagination options (cursor, number of items).
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If a `parentMessageId` is provided without a `channelId` or `conversationId`
 * and the parent message cannot be found ("Parent message not found").
 *
 * @returns {Promise<{ page: EnrichedMessage[]; isDone: boolean; continueCursor: string }>}
 * A paginated result where each message in `page` includes sender info, reactions, and thread data.
 * Null messages (where the member or user no longer exists) are filtered out.
 */
export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { channelId, conversationId, parentMessageId, paginationOpts } = args;

    let _conversationId = conversationId;

    // Only possible if we are replying in a thread in one-on-one conversations
    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await ctx.db.get(parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", channelId)
          .eq("parentMessageId", parentMessageId)
          .eq("conversationId", _conversationId),
      )
      .order("desc")
      .paginate(paginationOpts);

    const mappedMessages = await Promise.all(
      results.page.map(async (message) => {
        const member = await populateMember(ctx, message.memberId);
        const user = await populateUser(ctx, member!.userId);

        // Skip messages where the sender's member or user record no longer exists
        if (!member || !user) {
          return null;
        }

        const thread = await populateThread(ctx, message._id);
        const reactions = await populateReactions(ctx, message._id);

        // Resolve the storage URL for any attached image
        const image = message.image
          ? await ctx.storage.getUrl(message.image)
          : undefined;

        // Count how many times each reaction value appears across all reactions
        const reactionsWithCount = reactions.map((reaction) => {
          return {
            ...reaction,
            count: reactions.filter((r) => r.value === reaction.value).length,
          };
        });

        /**
         * Deduplicate reactions by emoji value.
         * Merges reactions with the same value into a single entry,
         * accumulating unique member IDs in the `memberIds` array.
         */
        const dedupedReactions = reactionsWithCount.reduce(
          (acc, reaction) => {
            const existingReaction = acc.find(
              (r) => r.value === reaction.value,
            );

            if (existingReaction) {
              existingReaction.memberIds = Array.from(
                new Set([...existingReaction.memberIds, reaction.memberId]),
              );
            } else {
              acc.push({
                ...reaction,
                memberIds: [reaction.memberId],
              });
            }

            return acc;
          },
          [] as (Doc<"reactions"> & {
            count: number;
            memberIds: Id<"members">[];
          })[],
        );

        // Remove the raw `memberId` field since memberIds array is now used instead
        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ memberId, ...rest }) => rest,
        );

        return {
          ...message,
          image,
          member,
          user,
          reactions: reactionsWithoutMemberIdProperty,
          threadCount: thread.count,
          threadImage: thread.image,
          threadName: thread.name,
          threadTimestamp: thread.timestamp,
        };
      }),
    );

    // Filter out any null entries from messages with missing member/user data
    const page = mappedMessages.filter((message) => message !== null);

    return {
      ...results,
      page,
    };
  },
});

/**
 * Creates a new message in a channel, conversation, or as a reply in a thread.
 * Verifies that the authenticated user is a member of the target workspace
 * before inserting the message.
 *
 * If the message is a threaded reply (only `parentMessageId` is provided without a
 * `channelId` or `conversationId`), the conversation ID is automatically inferred
 * from the parent message to support direct message thread replies.
 *
 * @mutation
 * @param {Object} args - The mutation arguments.
 * @param {string} args.body - The text content of the message.
 * @param {Id<"_storage">} [args.image] - Optional storage ID of an attached image.
 * @param {Id<"workspaces">} args.workspaceId - The workspace this message belongs to.
 * @param {Id<"channels">} [args.channelId] - The channel to post the message in.
 * @param {Id<"conversations">} [args.conversationId] - The direct conversation to post the message in.
 * @param {Id<"messages">} [args.parentMessageId] - The parent message ID if this is a thread reply.
 *
 * @throws {Error} If the user is not authenticated ("Unauthorized").
 * @throws {Error} If the authenticated user is not a member of the workspace ("Unauthorized").
 * @throws {Error} If a `parentMessageId` is provided and the parent message does not exist
 * ("Parent message not found").
 *
 * @returns {Promise<Id<"messages">>} The ID of the newly created message.
 */
export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    }

    const {
      body,
      image,
      workspaceId,
      channelId,
      conversationId,
      parentMessageId,
    } = args;

    let _conversationId = conversationId;

    // Only possible if we are replying in a thread in one-on-one conversations
    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await ctx.db.get(parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      memberId: member._id,
      body,
      image,
      workspaceId,
      channelId,
      conversationId: _conversationId,
      parentMessageId,
    });

    return messageId;
  },
});
