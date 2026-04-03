"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: isLoadingMember } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
    workspaceId,
  });

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);

  useEffect(() => {
    if (
      isLoadingWorkspace ||
      isLoadingChannels ||
      isLoadingMember ||
      !workspace ||
      !member
    )
      return;

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    channelId,
    isLoadingChannels,
    isLoadingWorkspace,
    isLoadingMember,
    open,
    router,
    setOpen,
    workspace,
    workspaceId,
    isAdmin,
    member,
  ]);

  if (isLoadingWorkspace || isLoadingChannels || isLoadingMember) {
    return (
      <div className="flex flex-col flex-1 gap-2 justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading workspace...
        </span>
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col flex-1 gap-2 justify-center items-center h-full">
        <TriangleAlertIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {!workspace ? "Workspace not found" : "Access denied"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-2 justify-center items-center h-full">
      <TriangleAlertIcon className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channels found</span>
    </div>
  );
};

export default WorkspaceIdPage;
