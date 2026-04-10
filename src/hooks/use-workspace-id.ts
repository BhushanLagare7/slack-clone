import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to extract the current workspace ID from URL parameters.
 *
 * This hook uses `useParams` from Next.js to get the workspace ID from the
 * current route parameters. It assumes the route structure includes a
 * `workspaceId` parameter (e.g., `/workspaces/[workspaceId]/channels/...`).
 *
 * @returns {Id<"workspaces"> | undefined} The workspace ID, or undefined if not present in URL
 *
 * @example
 * const workspaceId = useWorkspaceId();
 * // If URL is /workspaces/ws123/channels/ch456, returns "ws123"
 */
export const useWorkspaceId = () => {
  const params = useParams();
  return params.workspaceId as Id<"workspaces">;
};
