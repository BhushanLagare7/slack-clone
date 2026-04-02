import {
  AlertTriangleIcon,
  HashIcon,
  LoaderIcon,
  MessageSquareTextIcon,
  SendHorizontalIcon,
} from "lucide-react";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { SidebarItem } from "./sidebar-item";
import { UserItem } from "./user-item";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceSection } from "./workspace-section";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();

  const [, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: isLoadingMember } = useCurrentMember({
    workspaceId,
  });
  const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
    workspaceId,
  });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  if (
    isLoadingWorkspace ||
    isLoadingMember ||
    isLoadingChannels ||
    isLoadingMembers
  ) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <LoaderIcon className="text-white animate-spin size-5" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangleIcon className="text-white size-5" />
        <p className="text-sm text-white">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full">
      <WorkspaceHeader
        isAdmin={member.role === "admin"}
        workspace={workspace}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem
          icon={MessageSquareTextIcon}
          id="threads"
          label="Threads"
        />
        <SidebarItem
          icon={SendHorizontalIcon}
          id="drafts"
          label="Drafts & Sent"
        />
      </div>
      <WorkspaceSection
        hint="New channel"
        label="Channels"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            icon={HashIcon}
            id={item._id}
            label={item.name}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        hint="New direct messages"
        label="Direct Messages"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            image={item.user?.image}
            label={item.user?.name}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
