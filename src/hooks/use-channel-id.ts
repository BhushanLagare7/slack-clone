import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to extract the current channel ID from URL parameters.
 *
 * This hook uses `useParams` from Next.js to get the channel ID from the
 * current route parameters. It assumes the route structure includes a
 * `channelId` parameter (e.g., `/workspaces/[workspaceId]/channels/[channelId]`).
 *
 * @returns {Id<"channels"> | undefined} The channel ID, or undefined if not present in URL
 *
 * @example
 * const channelId = useChannelId();
 * // If URL is /workspaces/ws123/channels/ch456, returns "ch456"
 */
export const useChannelId = () => {
  const params = useParams();
  return params.channelId as Id<"channels">;
};
