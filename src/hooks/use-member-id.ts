import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to extract the current member ID from URL parameters.
 *
 * This hook uses `useParams` from Next.js to get the member ID from the
 * current route parameters. It assumes the route structure includes a
 * `memberId` parameter (e.g., `/workspaces/[workspaceId]/members/[memberId]`).
 *
 * @returns {Id<"members"> | undefined} The member ID, or undefined if not present in URL
 *
 * @example
 * const memberId = useMemberId();
 * // If URL is /workspaces/ws123/members/mem456, returns "mem456"
 */
export const useMemberId = () => {
  const params = useParams();
  return params.memberId as Id<"members">;
};
